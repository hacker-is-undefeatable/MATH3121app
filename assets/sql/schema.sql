CREATE TABLE public.questions (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  question text NOT NULL,
  correct_option text NOT NULL,
  option_1 text NOT NULL,
  option_2 text NOT NULL,
  option_3 text NOT NULL,
  option_4 text NOT NULL,
  year integer NOT NULL,
  question_no integer NOT NULL,
  topic_1 text NOT NULL,
  topic_2 text,
  img_link text,
  CONSTRAINT questions_pkey PRIMARY KEY (id)
);
CREATE TABLE public.scores (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  user_id uuid NOT NULL,
  score integer NOT NULL CHECK (score >= 0 AND score <= 100),
  created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
  topic text NOT NULL,
  total_questions integer NOT NULL,
  CONSTRAINT scores_pkey PRIMARY KEY (id),
  CONSTRAINT quiz_scores_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id)
);
CREATE TABLE public.user_answers (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  score_id bigint NOT NULL,
  question_id bigint NOT NULL,
  selected_option integer NOT NULL,
  is_correct boolean NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  CONSTRAINT user_answers_pkey PRIMARY KEY (id),
  CONSTRAINT user_answers_score_id_fkey FOREIGN KEY (score_id) REFERENCES public.scores(id),
  CONSTRAINT user_answers_question_id_fkey FOREIGN KEY (question_id) REFERENCES public.questions(id)
);