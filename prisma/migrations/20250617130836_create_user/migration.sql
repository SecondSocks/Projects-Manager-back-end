-- CreateTable
CREATE TABLE "user" (
    "id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "name" TEXT DEFAULT 'No Name',
    "surname" TEXT DEFAULT 'No Surname',
    "email" TEXT NOT NULL,
    "age" INTEGER DEFAULT 18,
    "avatar" TEXT DEFAULT '/uploads/images/avatars/default_avatar.jpg',
    "about_me" TEXT DEFAULT '',
    "country" TEXT DEFAULT 'Not selected',

    CONSTRAINT "user_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "user_email_key" ON "user"("email");
