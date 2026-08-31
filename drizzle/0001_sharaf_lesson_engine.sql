CREATE TABLE IF NOT EXISTS `lesson_attempts` (
  `id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
  `user_id` text,
  `session_id` text NOT NULL,
  `lesson_id` text NOT NULL,
  `question_id` text NOT NULL,
  `skill_id` text NOT NULL,
  `correct` integer NOT NULL,
  `hints_used` integer DEFAULT 0 NOT NULL,
  `mastery_score` integer DEFAULT 0 NOT NULL,
  `created_at` integer
);

CREATE INDEX IF NOT EXISTS `lesson_attempts_lesson_question_idx`
  ON `lesson_attempts` (`lesson_id`, `question_id`);

CREATE TABLE IF NOT EXISTS `skill_mastery` (
  `id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
  `user_id` text NOT NULL,
  `lesson_id` text NOT NULL,
  `skill_id` text NOT NULL,
  `score` integer DEFAULT 0 NOT NULL,
  `attempts` integer DEFAULT 0 NOT NULL,
  `correct_attempts` integer DEFAULT 0 NOT NULL,
  `hints_used` integer DEFAULT 0 NOT NULL,
  `updated_at` integer
);

CREATE UNIQUE INDEX IF NOT EXISTS `skill_mastery_user_lesson_skill`
  ON `skill_mastery` (`user_id`, `lesson_id`, `skill_id`);

CREATE TABLE IF NOT EXISTS `product_events` (
  `id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
  `user_id` text,
  `session_id` text NOT NULL,
  `lesson_id` text NOT NULL,
  `event_name` text NOT NULL,
  `question_id` text,
  `skill_id` text,
  `step_id` text,
  `metadata` text,
  `created_at` integer
);

CREATE INDEX IF NOT EXISTS `product_events_lesson_event_idx`
  ON `product_events` (`lesson_id`, `event_name`);
