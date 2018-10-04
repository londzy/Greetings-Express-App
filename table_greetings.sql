drop table if exists greetz;  
create table greetz(
	id serial not null primary key,
    greeted_names text not null,
    spotted_greetings int not null
);
