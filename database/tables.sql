CREATE TABLE users(  
    id SERIAL NOT NULL PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    password TEXT NOT NULL
);

CREATE TABLE links(
    id SERIAL NOT NULL PRIMARY KEY,
    "userId" INTEGER NOT NULL REFERENCES users(id),
    url TEXT NOT NULL,
    "shortUrl" TEXT NOT NULL UNIQUE,
    "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
    counter INTEGER NOT NULL DEFAULT 0
);