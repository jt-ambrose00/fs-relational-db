defaultdb=> CREATE TABLE blogs (
  id SERIAL PRIMARY KEY,
  author text,
  url text NOT NULL,
  title text NOT NULL,
  likes integer DEFAULT 0
);

insert into blogs (author, url, title) values ('Ron Stevens', 'www.thermite.com', 'All About Thermite!');
insert into blogs (author, url, title) values ('Ron Stevens', 'www.blackbeard.com', 'Blackbeard is overpowered');
insert into blogs (author, url, title) values ('John Stryker Meyer', 'www.macv-sog.com', 'Inside MACV-SOG');
