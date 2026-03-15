-- Migration: Create lesson_comments table
-- Date: 2026-03-15

CREATE TABLE IF NOT EXISTS lesson_comments (
    id VARCHAR(255) PRIMARY KEY,
    "lessonDetailsId" VARCHAR(255) NOT NULL,
    "userId" VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    "parentId" VARCHAR(255) NULL,
    likes INTEGER DEFAULT 0 NOT NULL,
    dislikes INTEGER DEFAULT 0 NOT NULL,
    "likedByUsers" TEXT NULL,
    "dislikedByUsers" TEXT NULL,
    "createdAt" TIMESTAMP DEFAULT NOW() NOT NULL,
    "updatedAt" TIMESTAMP DEFAULT NOW() NOT NULL,
    
    CONSTRAINT fk_lesson_comments_lesson_details
        FOREIGN KEY ("lessonDetailsId")
        REFERENCES lesson_details(id)
        ON DELETE CASCADE,
    
    CONSTRAINT fk_lesson_comments_parent
        FOREIGN KEY ("parentId")
        REFERENCES lesson_comments(id)
        ON DELETE CASCADE
);

-- Create index for faster lookups by lessonDetailsId
CREATE INDEX IF NOT EXISTS idx_lesson_comments_lesson_details_id
    ON lesson_comments("lessonDetailsId");

-- Create index for faster lookups by parentId (for replies)
CREATE INDEX IF NOT EXISTS idx_lesson_comments_parent_id
    ON lesson_comments("parentId");

-- Create index for user lookups
CREATE INDEX IF NOT EXISTS idx_lesson_comments_user_id
    ON lesson_comments("userId");
