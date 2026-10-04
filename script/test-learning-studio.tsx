import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { lessonRegistry } from "../shared/lesson-engine/registry";
import { buildLessonTabs } from "../src/features/lesson-engine/lessonNavigation";
import { buildLearningSections, LearningSection, LearningSectionNavigation } from "../src/features/lesson-engine/LearningStudio";
import { QuestionCard } from "../src/features/lesson-engine/QuestionCard";
import { LessonVideoPlayer, youtubePlayerUrl } from "../src/features/lesson-engine/LessonVideoPlayer";
import { PolygonLab } from "../src/features/lesson-engine/PolygonLab";
import { FormulaDiscoveryLab, MissingAngleLab, ExteriorTurnLab } from "../src/features/lesson-engine/VisualLessonLabs";

for (const { lesson } of Object.values(lessonRegistry)) {
  const tab = buildLessonTabs(lesson).find(tab => tab.id === "learn")!;
  const originalContent = JSON.stringify(lesson);
  const sections = buildLearningSections(lesson, tab.stepIndexes);
  assert.equal(JSON.stringify(lesson), originalContent, "Section split never mutates stored lesson definitions");
  assert.equal(sections.length, tab.stepIndexes.length + 1);
  assert.equal(sections[0].step.title, "الهدف من الدرس");
  assert.equal(sections[0].step.eyebrow, "الهدف من الدرس");
  assert.equal(sections[0].content, "objectives");
  assert.equal(sections[1].step.eyebrow, "شرح الدرس");
  assert.equal(sections[1].content, "introduction");
  assert.deepEqual(sections.map(section => section.sectionNumber), sections.map((_, index) => index + 1));
  assert.equal(new Set(sections.map(section => section.step.id)).size, sections.length);
  const navigation = renderToStaticMarkup(createElement(LearningSectionNavigation, { sections, onNavigate: () => undefined }));
  assert.ok(navigation.includes('aria-label="التنقل بين أقسام الشرح"'));
  assert.equal((navigation.match(/<button /g) ?? []).length, sections.length, "Each open section has a quick-navigation control");
  for (const { step } of sections) assert.ok(navigation.includes(`aria-controls="learning-section-${step.id}"`), "Navigation includes the independent goals anchor");
  assert.deepEqual(sections.slice(1).map(section => section.step.id), tab.stepIndexes.map(index => lesson.steps[index].id),
    "Original explanation anchors remain intact for review navigation");
  for (const { step, index, sectionNumber } of sections) {
    const html = renderToStaticMarkup(createElement(LearningSection, {
      step, index, sectionNumber, onFocus: () => undefined,
      children: createElement("p", {}, "محتوى القسم"),
    }));
    assert.ok(html.includes(`data-testid="learning-section-${step.id}"`));
    assert.ok(html.includes(`aria-labelledby="learning-title-${step.id}"`));
    assert.ok(html.includes(`data-learning-step-index="${index}"`));
    assert.ok(html.includes(step.title), "Original section titles remain intact");
    assert.ok(html.indexOf('class="studio-section-meta"') < html.indexOf('class="studio-section-title"'),
      "Section number and label precede the title in every lesson section");
    assert.ok(!/hidden|<details|<summary/.test(html.replace('aria-hidden="true"', "")), "Every section stays open");
    assert.notEqual(step.type, "assessment", "No exam in explanation tab");
  }
  console.log(`PASS ${lesson.id}: open studio sections, original labels and navigation IDs`);
}
for (const Lab of [PolygonLab, FormulaDiscoveryLab, MissingAngleLab, ExteriorTurnLab]) {
  const html = renderToStaticMarkup(createElement(Lab));
  assert.ok(html.includes("studio-workspace"));
  assert.ok(html.includes("data-activity-primary"));
  assert.ok(html.includes('role="img"'));
  assert.ok(!html.includes("disabled="));
}
assert.equal(lessonRegistry["l-mm6el08l"].lesson.steps.find(step => step.id === "teacher-summary")?.tutorMessage,
  undefined, "The redundant pre-exam tutor banner is removed from the content, not merely hidden");
const page = readFileSync(new URL("../src/features/lesson-engine/InteractiveLessonPage.tsx", import.meta.url), "utf8");
assert.ok(page.includes('<h1 data-testid="lesson-step-title">{lesson.title}</h1>'), "Interactive explanation heading contains only the current lesson name");
assert.ok(!page.includes("شرح درس {lesson.title}"), "Interactive heading excludes the redundant explanation prefix");
assert.ok(page.includes('content !== "objectives" && <StudioLessonIntroduction'), "Goals section excludes the explanation");
assert.ok(page.includes('content !== "introduction" && <>'), "Explanation section excludes goals and learning-method content");
assert.ok(page.includes('learningSections.map(({ step, index, content, sectionNumber })'), "Every section uses the new continuous numbering");
assert.ok(page.includes('className="p-5 text-center" data-testid="lesson-video-caption"'), "Selected video title and teacher name are centered together");
assert.ok(page.includes('data-testid="button-restart-assessment"') && page.includes('onClick={restartTest}'));
assert.ok(page.indexOf('data-testid="assessment-answer-count"') < page.indexOf('{showReport ?'), "Answered count is above the exam/result content");
assert.ok(page.includes('questionNumber={questionIndex + 1}') && page.includes('totalQuestions={stepQuestions.length}'), "Every exam and review card receives its current question position");
assert.ok(page.includes('if (cancelled || activeTabRef.current !== "learn") return;'), "Queued reading-observer callbacks cannot override a selected exam tab");
assert.ok(page.includes('if (activeTabRef.current !== "learn") return;'), "Queued section focus cannot override a later tab choice");
assert.ok(page.includes('key={`${session.assessmentRunId ?? session.sessionId}:${question.id}`}'), "Restart clears unsent question drafts by remounting cards");
assert.ok(page.includes('className="text-center text-sm font-black text-cyan-700">اختبار الدرس والنتيجة</p>'));
assert.ok(page.includes('mt-2 text-center text-2xl'), "Result title remains centered");
assert.ok(!page.includes("تابع الشرح بالسرعة المناسبة لك"), "Redundant video follow-up notice is removed");
assert.ok(!page.includes("أجب بنفسك من دون تلميحات") && !page.includes("سيأخذ التقرير عدد المحاولات في الحسبان"), "Old penalty instructions are removed");
assert.ok(!page.includes("loadedVideoId") && !page.includes("playSelectedVideo"), "Video is no longer gated behind a custom play screen");
assert.ok(page.includes('<LessonVideoPlayer key={selectedVideo.id}'), "Switching videos remounts the native player immediately");
const video = lessonRegistry["l-mm6el08l"].lesson.videos![0];
const playerUrl = new URL(youtubePlayerUrl(video.url, "https://staging.example.com"));
assert.equal(playerUrl.hostname, "www.youtube-nocookie.com", "Privacy-enhanced embed host remains unchanged");
assert.equal(playerUrl.searchParams.get("autoplay"), "0");
assert.equal(playerUrl.searchParams.get("enablejsapi"), "1");
assert.equal(playerUrl.searchParams.get("origin"), "https://staging.example.com");
assert.equal(playerUrl.searchParams.get("rel"), "0");
let playbackCallbacks = 0;
const hosted = renderToStaticMarkup(createElement(LessonVideoPlayer, {
  video: { ...video, source: "hosted", url: "/test.mp4", captionsUrl: "/test.vtt" }, onStarted: () => { playbackCallbacks++; },
}));
assert.ok(hosted.includes("<video") && hosted.includes("controls") && hosted.includes("<track"));
assert.ok(!hosted.includes("autoplay"), "Hosted video does not autoplay either");
assert.equal(playbackCallbacks, 0, "Opening a player is not counted as playback");
const reportSection = page.slice(page.indexOf('<section id="lesson-result"'));
assert.ok(reportSection.indexOf('data-testid="assessment-answer-review"') < reportSection.indexOf('<MasteryReport'),
  "Answer review is above mastery and recommendations in the result section");
const question = lessonRegistry["l-mm6el08l"].lesson.questions.find(question => question.id === "assessment-octagon-triangles")!;
for (const correct of [false, true]) {
  const feedback = correct ? question.correctFeedback : question.defaultIncorrectFeedback;
  const html = renderToStaticMarkup(createElement(QuestionCard, {
    question, assessmentMode: true, questionNumber: 2, totalQuestions: 5, onAttempt: () => undefined, onHint: () => undefined,
    progress: { questionId: question.id, skillId: question.skillId, answer: correct ? "6" : "5",
      correct, feedback, attempts: 1, hintsUsed: 0, score: correct ? 100 : 0 },
  }));
  assert.ok(html.includes("السؤال 2 من 5"), "Question ordinal remains visible with correct or incorrect feedback");
  assert.ok(html.includes(`<p>${feedback}</p>`), "Feedback is shown directly, without a recording notice");
  assert.ok(!html.includes("تم تسجيل محاولتك"));
  assert.ok(html.includes(correct ? "تمت الإجابة" : "أعد المحاولة"), "Retry and success actions remain intact");
}
assert.equal(lessonRegistry["l-mm6el08l"].lesson.steps.find(step => step.type === "video")?.tutorMessage, undefined,
  "Redundant video tutor banner is removed");
assert.equal(lessonRegistry["l-mm6el08l"].lesson.steps.find(step => step.type === "video")?.title,
  lessonRegistry["l-mm6el08l"].lesson.title, "The video tab heading uses the lesson name");
assert.ok(page.indexOf('data-testid="lesson-video-player"') < page.indexOf('data-testid="lesson-video-options"'),
  "The video player comes before the alternative explanation cards in DOM and keyboard order");
assert.ok(page.includes('step.type === "video" || step.type === "assessment" ? "text-center" : undefined'),
  "Video and exam headings are centered");
assert.ok(page.includes('step.type !== "assessment" && <p className="text-sm font-black text-cyan-700">{lessonTabs[activeTabIndex].title}</p>'),
  "Exam heading has no redundant tab label");
assert.ok(page.includes('{step.type === "assessment" ? lesson.title : step.title}</h1>'),
  "Exam heading uses the current lesson name");
assert.ok(page.includes('tab.id === "learn" ? "lesson-studio" : ""'), "Theme is scoped to learning tab");
assert.ok(page.includes('data-testid="lesson-step-title">{lesson.title}</h1>'),
  "The interactive explanation heading includes the current lesson name");
const css = readFileSync(new URL("../src/features/lesson-engine/learningStudio.css", import.meta.url), "utf8");
const sectionHeadingCss = css.match(/\.lesson-studio \.studio-section-head\s*\{([^}]+)\}/)?.[1] ?? "";
const objectivesCss = css.match(/\.lesson-studio \.studio-objectives\s*\{([^}]+)\}/)?.[1] ?? "";
assert.ok(!objectivesCss.includes("border-top"), "Independent objectives section has no redundant inner divider");
assert.ok(sectionHeadingCss.includes("border-bottom"), "Section heading boundary remains intact");
assert.ok(sectionHeadingCss.includes("flex-direction: column") && sectionHeadingCss.includes("align-items: center") && sectionHeadingCss.includes("text-align: center"),
  "Every section has centered metadata above its centered title");
assert.ok(!/\.studio-section-label\s*\{[^}]*clip:/.test(css), "Section labels remain visible on mobile");
assert.ok(css.includes("prefers-reduced-motion"));
assert.ok(css.includes("focus-visible"));
assert.ok(!css.includes("sharaf-activity-glow"));
console.log("PASS interactive controls, SVG semantics, scoped styling, reduced motion and keyboard focus");
