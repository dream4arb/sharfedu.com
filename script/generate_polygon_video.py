from __future__ import annotations

import argparse
import asyncio
import math
import os
import shutil
import subprocess
from pathlib import Path

import edge_tts
import imageio_ffmpeg
from arabic_reshaper import reshape
from bidi.algorithm import get_display
from mutagen.mp3 import MP3
from PIL import Image, ImageDraw, ImageFont


ROOT = Path(__file__).resolve().parents[1]
WORK = ROOT / ".local" / "video-generation" / "polygon-angles"
PUBLIC = ROOT / "public" / "videos" / "sharaf-polygon-angles"
CHARACTER = PUBLIC / "closing-tutor.png"
FINAL_VIDEO = PUBLIC / "sharaf-polygon-angles-whiteboard.mp4"
CAPTIONS = PUBLIC / "sharaf-polygon-angles-whiteboard.ar.vtt"
POSTER = PUBLIC / "sharaf-polygon-angles-poster.jpg"
FFMPEG = Path(imageio_ffmpeg.get_ffmpeg_exe())

WIDTH, HEIGHT = 1280, 720
FPS = 30
VOICE = "ar-SA-HamedNeural"
VOICE_RATE = "-8%"

FONT_REGULAR = Path("C:/Windows/Fonts/arial.ttf")
FONT_BOLD = Path("C:/Windows/Fonts/arialbd.ttf")

COLORS = {
    "board": "#F8FBF8",
    "ink": "#12212A",
    "muted": "#52636D",
    "teal": "#0E7490",
    "cyan": "#22A6B3",
    "amber": "#E59B1B",
    "green": "#15803D",
    "rose": "#C2415D",
    "line": "#DDE8E5",
    "white": "#FFFFFF",
    "dark": "#0B2630",
}


SCENES = [
    {
        "kind": "intro",
        "title": "زوايا المضلع",
        "eyebrow": "درس شارف الأصلي · سبورة تعليمية",
        "duration": 40,
        "bullets": [
            "نفهم الفكرة قبل حفظ القانون",
            "نحوّل المضلع إلى مثلثات نعرفها",
            "ثم نستخدم الفهم في الحل",
        ],
        "takeaway": "الفكرة الكبرى: المثلث هو وحدة بناء زوايا المضلعات.",
        "narration": """مرحبًا بك في درس زوايا المضلع من منصة شارف. في هذا الدرس لن نبدأ بحفظ قانون، بل سنبني الفكرة خطوة خطوة حتى يصبح القانون منطقيًا وسهل الاستخدام. سنتعرف أولًا إلى الزوايا الداخلية، ثم سنحوّل المضلعات إلى مثلثات، وبعد ذلك سنستنتج قانون مجموع الزوايا ونستخدمه في أمثلة متنوعة. وفي النهاية سنتعلم كيف نجد زاوية مجهولة، وما العلاقة بين الزوايا الداخلية والخارجية. جهّز ذهنك للرسم والملاحظة؛ لأن هدفنا أن تفهم، لا أن تحفظ فقط.""",
    },
    {
        "kind": "definition",
        "title": "ما المضلع؟ وما الزاوية الداخلية؟",
        "eyebrow": "المفهوم الأول",
        "duration": 45,
        "bullets": [
            "المضلع شكل مغلق بأضلاع مستقيمة",
            "كل التقاء بين ضلعين يصنع رأسًا",
            "الزاوية داخل الشكل هي زاوية داخلية",
        ],
        "takeaway": "عدد الرؤوس = عدد الأضلاع = عدد الزوايا الداخلية.",
        "narration": """المضلع هو شكل مغلق مكوّن من قطع مستقيمة. المثلث مضلع له ثلاثة أضلاع، والرباعي له أربعة، والخماسي له خمسة، وهكذا. عند التقاء ضلعين نحصل على رأس، وعند كل رأس توجد زاوية داخل الشكل نسميها زاوية داخلية. لذلك إذا كان للمضلع سبعة أضلاع، فله سبعة رؤوس وسبع زوايا داخلية أيضًا. في هذا الدرس نتعامل أساسًا مع المضلعات المحدبة، أي الأشكال التي لا يوجد فيها انبعاج إلى الداخل. المطلوب ليس قياس زاوية واحدة فقط، بل معرفة مجموع جميع الزوايا الموجودة داخل المضلع.""",
    },
    {
        "kind": "triangle",
        "title": "نقطة البداية: المثلث",
        "eyebrow": "حقيقة أساسية",
        "duration": 50,
        "bullets": [
            "مجموع زوايا أي مثلث يساوي 180 درجة",
            "يمكن جمع الزوايا الثلاث على خط مستقيم",
            "سنستخدم 180 درجة لكل مثلث يظهر",
        ],
        "takeaway": "كل مثلث داخل المضلع يضيف مئة وثمانين درجة إلى المجموع.",
        "narration": """قبل أن نفكر في الخماسي أو السداسي، نحتاج إلى حقيقة واحدة تعرفها غالبًا: مجموع الزوايا الداخلية لأي مثلث يساوي مئة وثمانين درجة. يمكن تخيل ذلك بقص الزوايا الثلاث ووضعها بجانب بعضها؛ ستكوّن زاوية مستقيمة. هذه الحقيقة هي حجر الأساس في الدرس كله. عندما نقسم مضلعًا إلى مثلثات، لن نحتاج إلى حفظ مجموع جديد لكل شكل. سنعد المثلثات فقط، ثم نضرب عددها في مئة وثمانين. انتبه إلى الفرق: مئة وثمانون ليست زاوية واحدة ثابتة في كل مثلث، بل هي مجموع زواياه الثلاث مهما تغير شكله.""",
    },
    {
        "kind": "split",
        "title": "قسّم المضلع من رأس واحد",
        "eyebrow": "الفكرة البصرية",
        "duration": 60,
        "bullets": [
            "اختر رأسًا واحدًا فقط",
            "صل الرأس بالرؤوس غير المجاورة",
            "الخماسي يتحول إلى 3 مثلثات",
        ],
        "takeaway": "لا تتقاطع الأقطار، ولا تترك جزءًا خارج المثلثات.",
        "narration": """انظر إلى الخماسي. اختر رأسًا واحدًا في أعلى الشكل، ثم ارسم منه أقطارًا إلى الرؤوس غير المجاورة. لا نرسم إلى الرأس نفسه، ولا إلى الرأسين المجاورين؛ لأن الضلعين الموجودين أصلًا يحدان الشكل. بعد رسم القطرين يظهر أمامنا ثلاثة مثلثات تغطي الخماسي كاملًا، من غير تداخل ومن غير فراغات. بما أن كل مثلث مجموع زواياه مئة وثمانون درجة، يصبح مجموع زوايا الخماسي ثلاثة في مئة وثمانين، أي خمسمئة وأربعين درجة. وإذا كررنا الفكرة مع سداسي فسنرسم ثلاثة أقطار من الرأس نفسه، وسنحصل على أربعة مثلثات. المهم أن تبدأ الخطوط كلها من رأس واحد.""",
    },
    {
        "kind": "pattern",
        "title": "اكتشف النمط: لماذا نطرح 2؟",
        "eyebrow": "من الرسم إلى العلاقة",
        "duration": 60,
        "bullets": [
            "المثلث: ثلاثة أضلاع ومثلث واحد",
            "الخماسي: خمسة أضلاع وثلاثة مثلثات",
            "السداسي: ستة أضلاع وأربعة مثلثات",
        ],
        "takeaway": "عدد المثلثات أقل من عدد الأضلاع بمقدار اثنين.",
        "narration": """لنضع النتائج في نمط واضح. المثلث له ثلاثة أضلاع، وهو مثلث واحد. الرباعي له أربعة أضلاع وينقسم إلى مثلثين. الخماسي له خمسة أضلاع وينقسم إلى ثلاثة مثلثات. والسداسي له ستة أضلاع وينقسم إلى أربعة مثلثات. في كل مرة نلاحظ أن عدد المثلثات أقل من عدد الأضلاع باثنين. لماذا؟ لأننا اخترنا رأسًا ثابتًا، والضلعين المجاورين لهذا الرأس يحدان أول وآخر مثلث، ولا يصنعان مثلثين إضافيين. لهذا نكتب عدد المثلثات على صورة: عدد الأضلاع ناقص اثنين. فإذا كان عدد الأضلاع سبعة، فعدد المثلثات خمسة. وإذا كان اثني عشر، فعدد المثلثات عشرة.""",
    },
    {
        "kind": "formula",
        "title": "قانون مجموع الزوايا الداخلية",
        "eyebrow": "القانون ومعنى رموزه",
        "duration": 55,
        "bullets": [
            "الرمز إن يمثل عدد الأضلاع",
            "إن ناقص اثنين يمثل عدد المثلثات",
            "الرمز إس يمثل مجموع الزوايا الداخلية",
        ],
        "takeaway": "المجموع يساوي عدد المثلثات مضروبًا في 180 درجة.",
        "narration": """الآن أصبح القانون نتيجة للفهم، وليس معلومة منفصلة. نرمز لعدد الأضلاع بالحرف إن، ونرمز لمجموع الزوايا الداخلية بالحرف إس. عدد المثلثات هو إن ناقص اثنين، وكل مثلث يضيف مئة وثمانين درجة. إذن إس يساوي: إن ناقص اثنين، الكل مضروب في مئة وثمانين درجة. ترتيب الحل مهم. أولًا حدد عدد الأضلاع. ثانيًا اطرح اثنين لتحصل على عدد المثلثات. ثالثًا اضرب الناتج في مئة وثمانين. الخطأ الشائع هو ضرب عدد الأضلاع مباشرة في مئة وثمانين. تذكر دائمًا: نحن نضرب عدد المثلثات، وليس عدد الأضلاع.""",
    },
    {
        "kind": "examples",
        "title": "أمثلة سريعة على القانون",
        "eyebrow": "طبّق خطوة بخطوة",
        "duration": 60,
        "bullets": [
            "السداسي: أربعة مثلثات ومجموعه سبعمئة وعشرون درجة",
            "السباعي: خمسة مثلثات ومجموعه تسعمئة درجة",
            "ذو اثني عشر ضلعًا: عشرة مثلثات ومجموعه ألف وثمانمئة درجة",
        ],
        "takeaway": "كل ضلع جديد يضيف مثلثًا، أي يضيف مئة وثمانين درجة إلى المجموع.",
        "narration": """لنطبق القانون على ثلاثة أمثلة. في السداسي، عدد الأضلاع ستة. نطرح اثنين فنحصل على أربعة مثلثات، ثم نضرب أربعة في مئة وثمانين، فيكون المجموع سبعمئة وعشرين درجة. في السباعي، سبعة ناقص اثنين يساوي خمسة، وخمسة في مئة وثمانين يساوي تسعمئة درجة. أما المضلع الذي له اثنا عشر ضلعًا، فنحسب اثني عشر ناقص اثنين، فنحصل على عشرة مثلثات، وعشرة في مئة وثمانين تساوي ألفًا وثمانمئة درجة. لاحظ أيضًا أن الانتقال من مضلع إلى المضلع الذي يليه بإضافة ضلع واحد يزيد مجموع الزوايا بمئة وثمانين درجة، لأن مثلثًا جديدًا ظهر في التقسيم.""",
    },
    {
        "kind": "missing",
        "title": "كيف نجد زاوية مجهولة؟",
        "eyebrow": "استخدم المجموع كميزانية",
        "duration": 55,
        "bullets": [
            "مجموع زوايا الرباعي ثلاثمئة وستون درجة",
            "مجموع الزوايا المعروفة ثلاثمئة وخمس عشرة درجة",
            "الزاوية المتبقية خمس وأربعون درجة",
        ],
        "takeaway": "المجهول = مجموع زوايا المضلع − مجموع الزوايا المعروفة.",
        "narration": """أحيانًا لا يُطلب منك مجموع الزوايا، بل قياس زاوية مجهولة. تعامل مع المجموع كأنه ميزانية كاملة. لدينا رباعي، إذن مجموع زواياه ثلاثمئة وستون درجة. ثلاث زوايا معروفة: مئة وخمس وثلاثون، وتسعون، وتسعون. نجمعها فنحصل على ثلاثمئة وخمس عشرة درجة. الزاوية المجهولة هي الجزء المتبقي من الميزانية، لذلك نحسب ثلاثمئة وستين ناقص ثلاثمئة وخمس عشرة، فيكون الناتج خمسًا وأربعين درجة. لا تفترض أن الزاوية المجهولة قائمة، ولا تقسّم المجموع بالتساوي إلا إذا أخبرك السؤال أن المضلع منتظم.""",
    },
    {
        "kind": "exterior",
        "title": "الزوايا الخارجية: دورة كاملة",
        "eyebrow": "مفهوم مكمل",
        "duration": 55,
        "bullets": [
            "عند كل رأس نغيّر اتجاهنا",
            "بعد الدوران حول المضلع نعود للاتجاه الأول",
            "مجموع الزوايا الخارجية دائمًا ثلاثمئة وستون درجة",
        ],
        "takeaway": "في المضلع المنتظم نقسم 360 درجة على عدد الأضلاع.",
        "narration": """تخيل أنك تمشي على حدود مضلع. عند كل رأس تحتاج إلى أن تدور قليلًا لتتابع السير على الضلع التالي. مقدار هذا الدوران يمثل زاوية خارجية. بعد أن تكمل دورة حول الشكل وتعود إلى نقطة البداية، تكون قد دُرت دورة كاملة، أي ثلاثمئة وستين درجة. لذلك مجموع زاوية خارجية واحدة عند كل رأس لأي مضلع محدب يساوي دائمًا ثلاثمئة وستين درجة، مهما تغير عدد الأضلاع. وإذا كان المضلع منتظمًا، فالزوايا الخارجية متساوية، فنقسم ثلاثمئة وستين على عدد الأضلاع. في التساعي المنتظم مثلًا، ثلاثمئة وستون على تسعة تساوي أربعين درجة.""",
    },
    {
        "kind": "challenge",
        "title": "تحدٍ سريع قبل الخلاصة",
        "eyebrow": "فكّر ثم اكشف الحل",
        "duration": 55,
        "bullets": [
            "ثماني الأضلاع: كم مثلثًا؟",
            "ما مجموع زواياه الداخلية؟",
            "تساعي منتظم: ما زاويته الخارجية؟",
        ],
        "takeaway": "الإجابات: ستة مثلثات، وألف وثمانون درجة، وأربعون درجة.",
        "narration": """توقف لحظة وحاول الإجابة ذهنيًا. مضلع ثماني الأضلاع: كم مثلثًا ينتج عند تقسيمه من رأس واحد؟ نطرح اثنين من ثمانية، إذن ستة مثلثات. وما مجموع زواياه الداخلية؟ ستة في مئة وثمانين يساوي ألفًا وثمانين درجة. سؤال آخر: مضلع تساعي منتظم، ما قياس زاويته الخارجية الواحدة؟ مجموع الزوايا الخارجية ثلاثمئة وستون، ولأن الزوايا متساوية نقسم على تسعة، فنحصل على أربعين درجة. إذا أخطأت في أي نتيجة، ارجع إلى الخطوة السابقة وحدد أولًا: هل السؤال عن عدد المثلثات، أم مجموع الزوايا الداخلية، أم زاوية خارجية؟""",
    },
    {
        "kind": "recap",
        "title": "خريطة الدرس في أربع نقاط",
        "eyebrow": "ثبّت الفهم",
        "duration": 40,
        "bullets": [
            "المثلث: مجموع زواياه مئة وثمانون درجة",
            "عدد المثلثات أقل من عدد الأضلاع باثنين",
            "المجموع الداخلي: عدد المثلثات في مئة وثمانين",
            "المجموع الخارجي: ثلاثمئة وستون درجة",
        ],
        "takeaway": "ابدأ دائمًا بتحديد المطلوب وعدد الأضلاع.",
        "narration": """لنلخص الدرس في أربع نقاط. أولًا: مجموع زوايا المثلث مئة وثمانون درجة. ثانيًا: تقسيم مضلع من رأس واحد ينتج عددًا من المثلثات يساوي عدد الأضلاع ناقص اثنين. ثالثًا: مجموع الزوايا الداخلية يساوي إن ناقص اثنين، مضروبًا في مئة وثمانين درجة. رابعًا: مجموع زاوية خارجية واحدة عند كل رأس يساوي ثلاثمئة وستين درجة. ولإيجاد زاوية مجهولة، احسب المجموع الكامل ثم اطرح منه مجموع الزوايا المعروفة. هذه الخريطة تكفي لتعيد بناء الحل حتى لو نسيت جزءًا من القانون.""",
    },
    {
        "kind": "outro",
        "title": "أحسنت! الآن حان دورك",
        "eyebrow": "شارف معك حتى تتقن",
        "duration": 25,
        "bullets": [
            "طبّق الفكرة في الأنشطة التالية",
            "إذا أخطأت، استخدم التلميح ثم حاول مجددًا",
            "واسأل شارف: لماذا نطرح 2؟",
        ],
        "takeaway": "الفهم يثبت بالمحاولة، لا بالمشاهدة وحدها.",
        "narration": """أحسنت. أصبحت الآن تعرف من أين جاء القانون، وكيف تستخدمه في المجموع والزاوية المجهولة والزوايا الخارجية. انتقل إلى الأنشطة التالية وجرّب بنفسك. وإذا أخطأت، فهذا جزء طبيعي من التعلم؛ اطلب تلميحًا وحاول مرة أخرى. ويمكنك في أي وقت أن تسأل معلم شارف عن الخطوة التي لم تتضح لك. نراك في النشاط التالي.""",
    },
]


def font(size: int, bold: bool = False) -> ImageFont.FreeTypeFont:
    return ImageFont.truetype(str(FONT_BOLD if bold else FONT_REGULAR), size)


def ar(text: str) -> str:
    return get_display(reshape(text))


def wrap_words(text: str, max_chars: int) -> list[str]:
    words = text.split()
    lines: list[str] = []
    current: list[str] = []
    size = 0
    for word in words:
        extra = len(word) + (1 if current else 0)
        if current and size + extra > max_chars:
            lines.append(" ".join(current))
            current = [word]
            size = len(word)
        else:
            current.append(word)
            size += extra
    if current:
        lines.append(" ".join(current))
    return lines


def draw_ar(draw: ImageDraw.ImageDraw, text: str, x: int, y: int, fnt: ImageFont.FreeTypeFont, fill: str, max_chars: int = 44, spacing: int = 10) -> int:
    lines = wrap_words(text, max_chars)
    line_h = fnt.size + spacing
    for line in lines:
        draw.text((x, y), ar(line), font=fnt, fill=fill, anchor="ra")
        y += line_h
    return y


def rounded(draw: ImageDraw.ImageDraw, box: tuple[int, int, int, int], radius: int, fill: str, outline: str | None = None, width: int = 1) -> None:
    draw.rounded_rectangle(box, radius=radius, fill=fill, outline=outline, width=width)


def polygon_points(sides: int, center: tuple[int, int], radius: int, rotation: float = -math.pi / 2) -> list[tuple[float, float]]:
    cx, cy = center
    return [
        (cx + radius * math.cos(rotation + i * 2 * math.pi / sides), cy + radius * math.sin(rotation + i * 2 * math.pi / sides))
        for i in range(sides)
    ]


def draw_polygon(draw: ImageDraw.ImageDraw, sides: int, center: tuple[int, int], radius: int, split: bool = False, progress: float = 1.0) -> None:
    points = polygon_points(sides, center, radius)
    draw.polygon(points, fill="#E9FAFC", outline=COLORS["teal"], width=6)
    for x, y in points:
        draw.ellipse((x - 5, y - 5, x + 5, y + 5), fill=COLORS["ink"])
    if split:
        diagonals = points[2:-1]
        count = max(0, min(len(diagonals), math.ceil(len(diagonals) * progress)))
        for target in diagonals[:count]:
            draw.line((points[0], target), fill=COLORS["amber"], width=5)


def base_board(scene_index: int, scene: dict) -> tuple[Image.Image, ImageDraw.ImageDraw]:
    image = Image.new("RGB", (WIDTH, HEIGHT), COLORS["board"])
    draw = ImageDraw.Draw(image)
    for y in range(92, HEIGHT, 28):
        for x in range(28, WIDTH, 28):
            draw.ellipse((x, y, x + 2, y + 2), fill="#DCE8E4")
    draw.rectangle((0, 0, WIDTH, 74), fill=COLORS["dark"])
    draw.text((WIDTH - 36, 38), ar("شارف · رياضيات أول ثانوي"), font=font(24, True), fill=COLORS["white"], anchor="ra")
    draw.text((36, 38), f"{scene_index + 1:02d} / {len(SCENES):02d}", font=font(20, True), fill="#A5F3FC", anchor="la")
    progress = int(WIDTH * (scene_index + 1) / len(SCENES))
    draw.rectangle((0, 70, WIDTH, 74), fill="#21404B")
    draw.rectangle((0, 70, progress, 74), fill=COLORS["cyan"])
    rounded(draw, (830, 96, 1238, 132), 18, "#DDF5F7")
    draw.text((1218, 114), ar(scene["eyebrow"]), font=font(19, True), fill=COLORS["teal"], anchor="ra")
    draw.text((1218, 171), ar(scene["title"]), font=font(39, True), fill=COLORS["ink"], anchor="ra")
    return image, draw


def draw_bullet(draw: ImageDraw.ImageDraw, text: str, y: int, color: str = COLORS["teal"]) -> None:
    rounded(draw, (680, y - 6, 1218, y + 62), 18, COLORS["white"], COLORS["line"], 2)
    draw.ellipse((1170, y + 16, 1186, y + 32), fill=color)
    draw_ar(draw, text, 1150, y + 13, font(23, True), COLORS["ink"], max_chars=38)


def draw_visual(draw: ImageDraw.ImageDraw, scene: dict, phase: int) -> None:
    kind = scene["kind"]
    progress = min(1.0, phase / 4)
    if kind == "intro":
        for i, sides in enumerate((3, 4, 5)):
            draw_polygon(draw, sides, (170 + i * 190, 375), 70, split=phase >= 3, progress=progress)
            draw.text((170 + i * 190, 480), f"{sides} - 2", font=font(25, True), fill=COLORS["teal"], anchor="mm")
    elif kind == "definition":
        for i, sides in enumerate((3, 4, 6)):
            draw_polygon(draw, sides, (170 + i * 190, 375), 70)
            draw.text((170 + i * 190, 475), str(sides), font=font(27, True), fill=COLORS["teal"], anchor="mm")
    elif kind == "triangle":
        draw_polygon(draw, 3, (340, 370), 150)
        if phase >= 2:
            for pos, label in [((340, 205), "60°"), ((190, 470), "60°"), ((490, 470), "60°")]:
                draw.text(pos, label, font=font(28, True), fill=COLORS["rose"], anchor="mm")
        if phase >= 3:
            draw.text((340, 575), "60° + 60° + 60° = 180°", font=font(30, True), fill=COLORS["teal"], anchor="mm")
    elif kind == "split":
        draw_polygon(draw, 5, (340, 370), 170, split=phase >= 2, progress=progress)
        if phase >= 3:
            draw.text((340, 575), "3 × 180° = 540°", font=font(34, True), fill=COLORS["teal"], anchor="mm")
    elif kind == "pattern":
        rows = [(3, 1), (4, 2), (5, 3), (6, 4)]
        for i, (sides, triangles) in enumerate(rows[: max(1, phase)]):
            y = 245 + i * 84
            rounded(draw, (90, y, 610, y + 64), 15, COLORS["white"], COLORS["line"], 2)
            draw.text((560, y + 32), ar(f"{sides} أضلاع"), font=font(24, True), fill=COLORS["ink"], anchor="rm")
            draw.text((350, y + 32), "←", font=font(30, True), fill=COLORS["amber"], anchor="mm")
            draw.text((150, y + 32), ar(f"{triangles} مثلث"), font=font(24, True), fill=COLORS["teal"], anchor="lm")
        if phase >= 4:
            draw.text((350, 620), "triangles = n - 2", font=font(31, True), fill=COLORS["rose"], anchor="mm")
    elif kind == "formula":
        rounded(draw, (80, 240, 630, 430), 30, COLORS["dark"])
        draw.text((355, 330), "S = (n - 2) × 180°", font=font(44, True), fill="#A5F3FC", anchor="mm")
        if phase >= 2:
            draw.text((355, 470), ar("عدد المثلثات"), font=font(24, True), fill=COLORS["teal"], anchor="mm")
            draw.line((290, 440, 355, 390), fill=COLORS["amber"], width=4)
        if phase >= 3:
            draw.text((355, 555), "n = sides", font=font(27, True), fill=COLORS["muted"], anchor="mm")
    elif kind == "examples":
        examples = [(6, "720°"), (7, "900°"), (12, "1800°")]
        for i, (sides, result) in enumerate(examples[: max(1, min(3, phase))]):
            x = 150 + i * 190
            draw_polygon(draw, min(sides, 10), (x, 350), 65)
            draw.text((x, 455), f"n={sides}", font=font(23, True), fill=COLORS["muted"], anchor="mm")
            draw.text((x, 500), result, font=font(30, True), fill=COLORS["teal"], anchor="mm")
    elif kind == "missing":
        points = polygon_points(4, (340, 360), 150, rotation=math.pi / 4)
        draw.polygon(points, fill="#E9FAFC", outline=COLORS["teal"], width=6)
        labels = ["135°", "90°", "؟", "90°"]
        for (x, y), label in zip(points, labels):
            draw.text((x, y), label, font=font(25, True), fill=COLORS["rose"], anchor="mm")
        if phase >= 3:
            draw.text((340, 570), "360° - 315° = 45°", font=font(35, True), fill=COLORS["teal"], anchor="mm")
    elif kind == "exterior":
        draw_polygon(draw, 6, (340, 360), 150)
        if phase >= 2:
            draw.arc((150, 170, 530, 550), start=15, end=345, fill=COLORS["amber"], width=8)
            draw.polygon([(520, 280), (545, 295), (520, 310)], fill=COLORS["amber"])
        if phase >= 3:
            draw.text((340, 580), "Σ exterior = 360°", font=font(34, True), fill=COLORS["teal"], anchor="mm")
    elif kind == "challenge":
        draw_polygon(draw, 8, (250, 350), 130, split=phase >= 2, progress=progress)
        if phase >= 3:
            rounded(draw, (390, 270, 630, 450), 25, "#EAF8EE", "#B9E5C7", 2)
            draw.text((510, 320), "6 triangles", font=font(27, True), fill=COLORS["green"], anchor="mm")
            draw.text((510, 380), "1080°", font=font(38, True), fill=COLORS["green"], anchor="mm")
    elif kind == "recap":
        rules = ["180°", "n - 2", "(n - 2) × 180°", "360°"]
        for i, rule in enumerate(rules[: max(1, phase)]):
            x = 170 + (i % 2) * 280
            y = 280 + (i // 2) * 170
            rounded(draw, (x - 115, y - 55, x + 115, y + 55), 24, COLORS["white"], COLORS["line"], 2)
            draw.text((x, y), rule, font=font(29, True), fill=COLORS["teal"], anchor="mm")
    elif kind == "outro":
        if CHARACTER.exists():
            character = Image.open(CHARACTER).convert("RGB")
            crop = character.crop((500, 0, character.width, character.height))
            crop.thumbnail((610, 540), Image.Resampling.LANCZOS)
            board = draw._image
            x = 20
            y = 145
            board.paste(crop, (x, y))
        if phase >= 3:
            rounded(draw, (80, 605, 620, 665), 22, COLORS["dark"])
            draw.text((350, 635), ar("أحسنت، نراك في النشاط التالي"), font=font(25, True), fill=COLORS["white"], anchor="mm")


def render_scene(scene_index: int, phase: int) -> Image.Image:
    scene = SCENES[scene_index]
    image, draw = base_board(scene_index, scene)
    if scene["kind"] == "outro":
        draw_visual(draw, scene, phase)
        text_x = 1218
    else:
        draw_visual(draw, scene, phase)
        text_x = 1218
    bullet_count = min(len(scene["bullets"]), max(0, phase))
    for index, bullet in enumerate(scene["bullets"][:bullet_count]):
        draw_bullet(draw, bullet, 225 + index * 88, COLORS["teal"] if index < 2 else COLORS["amber"])
    if phase >= 4:
        rounded(draw, (680, 520, 1218, 645), 22, "#FFF6DD", "#F0D99A", 2)
        draw.text((1184, 548), ar("الخلاصة"), font=font(20, True), fill="#A15C00", anchor="ra")
        draw_ar(draw, scene["takeaway"], 1184, 580, font(22, True), COLORS["ink"], max_chars=42, spacing=7)
    return image


async def generate_audio() -> list[Path]:
    audio_dir = WORK / "audio"
    audio_dir.mkdir(parents=True, exist_ok=True)
    paths: list[Path] = []
    for index, scene in enumerate(SCENES):
        target = audio_dir / f"scene-{index + 1:02d}.mp3"
        paths.append(target)
        if target.exists() and target.stat().st_size > 10_000:
            continue
        communicate = edge_tts.Communicate(scene["narration"], VOICE, rate=VOICE_RATE, volume="+0%")
        await communicate.save(str(target))
        print(f"audio {index + 1}/{len(SCENES)}")
    return paths


def media_duration(path: Path) -> float:
    return float(MP3(path).info.length)


def compute_durations(audio_paths: list[Path]) -> list[float]:
    durations = [max(float(scene["duration"]), media_duration(path) + 1.5) for scene, path in zip(SCENES, audio_paths)]
    total = sum(durations)
    if total < 600:
        extra = (600 - total) / len(durations)
        durations = [duration + extra for duration in durations]
    return durations


def render_slides(durations: list[float]) -> Path:
    frames_dir = WORK / "frames"
    frames_dir.mkdir(parents=True, exist_ok=True)
    concat_path = WORK / "slides.concat.txt"
    lines: list[str] = []
    for scene_index, duration in enumerate(durations):
        phase_count = 5
        phase_duration = duration / phase_count
        for phase in range(phase_count):
            path = frames_dir / f"scene-{scene_index + 1:02d}-phase-{phase}.png"
            render_scene(scene_index, phase).save(path, optimize=True)
            lines.append(f"file '{path.as_posix()}'")
            lines.append(f"duration {phase_duration:.4f}")
        lines.append(f"file '{path.as_posix()}'")
    concat_path.write_text("\n".join(lines) + "\n", encoding="utf-8")
    first_complete = frames_dir / "scene-01-phase-4.png"
    Image.open(first_complete).convert("RGB").save(POSTER, quality=90, optimize=True)
    return concat_path


def pad_audio(audio_paths: list[Path], durations: list[float]) -> Path:
    padded_dir = WORK / "padded-audio"
    padded_dir.mkdir(parents=True, exist_ok=True)
    padded_paths: list[Path] = []
    for index, (source, duration) in enumerate(zip(audio_paths, durations)):
        target = padded_dir / f"scene-{index + 1:02d}.wav"
        padded_paths.append(target)
        subprocess.run([
            str(FFMPEG), "-y", "-loglevel", "error", "-i", str(source),
            "-af", f"apad=pad_dur={duration:.3f},atrim=duration={duration:.3f}",
            "-ar", "48000", "-ac", "2", str(target),
        ], check=True)
    concat = WORK / "audio.concat.txt"
    concat.write_text("\n".join(f"file '{path.as_posix()}'" for path in padded_paths) + "\n", encoding="utf-8")
    output = WORK / "narration.wav"
    subprocess.run([
        str(FFMPEG), "-y", "-loglevel", "error", "-f", "concat", "-safe", "0", "-i", str(concat),
        "-c", "copy", str(output),
    ], check=True)
    return output


def timestamp(seconds: float) -> str:
    millis = int(round(seconds * 1000))
    hours, millis = divmod(millis, 3_600_000)
    minutes, millis = divmod(millis, 60_000)
    secs, millis = divmod(millis, 1000)
    return f"{hours:02d}:{minutes:02d}:{secs:02d}.{millis:03d}"


def write_captions(durations: list[float], target_total: float = 600.0) -> None:
    entries: list[str] = []
    counter = 1
    cursor = 0.0
    scale = target_total / sum(durations)
    for scene, raw_duration in zip(SCENES, durations):
        duration = raw_duration * scale
        sentences = [part.strip() for part in scene["narration"].replace("؟", "؟|").replace(".", ".|").split("|") if part.strip()]
        weights = [max(1, len(sentence.split())) for sentence in sentences]
        total_weight = sum(weights)
        scene_cursor = cursor
        for sentence, weight in zip(sentences, weights):
            slot = duration * weight / total_weight
            end = scene_cursor + slot
            entries.append(f"{counter}\n{timestamp(scene_cursor)} --> {timestamp(end)}\n{sentence}\n")
            counter += 1
            scene_cursor = end
        cursor += duration
    CAPTIONS.write_text("WEBVTT\n\n" + "\n".join(entries), encoding="utf-8")


def assemble(slides_concat: Path, narration: Path, raw_total: float, target_total: float = 600.0) -> None:
    silent = WORK / "silent.mp4"
    full_length = WORK / "full-length.mp4"
    subprocess.run([
        str(FFMPEG), "-y", "-loglevel", "error", "-f", "concat", "-safe", "0", "-i", str(slides_concat),
        "-vf", f"fps={FPS},format=yuv420p", "-c:v", "libx264", "-preset", "medium", "-crf", "21", "-movflags", "+faststart", str(silent),
    ], check=True)
    subprocess.run([
        str(FFMPEG), "-y", "-loglevel", "error", "-i", str(silent), "-i", str(narration),
        "-c:v", "copy", "-c:a", "aac", "-b:a", "160k", "-shortest", "-movflags", "+faststart", str(full_length),
    ], check=True)
    speed = raw_total / target_total
    subprocess.run([
        str(FFMPEG), "-y", "-loglevel", "error", "-i", str(full_length),
        "-filter_complex", f"[0:v]setpts=PTS/{speed:.8f}[v];[0:a]atempo={speed:.8f}[a]",
        "-map", "[v]", "-map", "[a]", "-t", f"{target_total:.3f}",
        "-c:v", "libx264", "-preset", "veryfast", "-crf", "20", "-c:a", "aac", "-b:a", "160k", "-movflags", "+faststart", str(FINAL_VIDEO),
    ], check=True)


def main() -> None:
    parser = argparse.ArgumentParser(description="Generate the Sharaf polygon-angles whiteboard lesson video.")
    parser.add_argument("--skip-audio", action="store_true", help="Reuse already generated scene audio.")
    parser.add_argument("--captions-only", action="store_true", help="Regenerate WebVTT captions from existing scene audio.")
    args = parser.parse_args()
    WORK.mkdir(parents=True, exist_ok=True)
    PUBLIC.mkdir(parents=True, exist_ok=True)
    if not CHARACTER.exists():
        raise FileNotFoundError(f"Missing closing character: {CHARACTER}")
    if args.skip_audio or args.captions_only:
        audio_paths = [WORK / "audio" / f"scene-{index + 1:02d}.mp3" for index in range(len(SCENES))]
    else:
        audio_paths = asyncio.run(generate_audio())
    if not all(path.exists() for path in audio_paths):
        raise FileNotFoundError("One or more scene audio files are missing.")
    durations = compute_durations(audio_paths)
    print("scene durations:", ", ".join(f"{value:.1f}" for value in durations))
    print("total duration:", round(sum(durations), 1))
    if args.captions_only:
        write_captions(durations)
        print(f"captions: {CAPTIONS}")
        return
    slides_concat = render_slides(durations)
    narration = pad_audio(audio_paths, durations)
    write_captions(durations)
    assemble(slides_concat, narration, sum(durations))
    print(f"video: {FINAL_VIDEO}")
    print(f"captions: {CAPTIONS}")
    print(f"poster: {POSTER}")


if __name__ == "__main__":
    main()
