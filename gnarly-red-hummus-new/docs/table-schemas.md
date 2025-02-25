# Table Schemas

## Users Table
| Column Name | Data Type | Constraints | Default Value |
|-------------|-----------|-------------|---------------|
| id | uuid | PRIMARY KEY | Generated UUID |
| name | text | NOT NULL | |
| email | text | NOT NULL, UNIQUE | |
| created_at | timestamp with time zone | | DEFAULT now() |

## Courses Table
| Column Name | Data Type | Constraints | Default Value |
|-------------|-----------|-------------|---------------|
| id | bigint | PRIMARY KEY | Generated ID |
| name | text | NOT NULL | |
| location | text | | |
| created_at | timestamp with time zone | | DEFAULT now() |

## Rounds Table
| Column Name | Data Type | Constraints | Default Value |
|-------------|-----------|-------------|---------------|
| id | bigint | PRIMARY KEY | Generated ID |
| profile_id | uuid | NOT NULL, FOREIGN KEY REFERENCES users(id) | |
| course_id | bigint | NOT NULL, FOREIGN KEY REFERENCES courses(id) | |
| score | integer | NOT NULL | |
| date | timestamp with time zone | NOT NULL | |
| created_at | timestamp with time zone | | DEFAULT now() |

## Shots Table
| Column Name | Data Type | Constraints | Default Value |
|-------------|-----------|-------------|---------------|
| id | bigint | PRIMARY KEY | Generated ID |
| round_id | bigint | NOT NULL, FOREIGN KEY REFERENCES rounds(id) ON DELETE CASCADE | |
| hole_number | integer | NOT NULL | |
| shot_type | text | NOT NULL | |
| is_fairway_hit | boolean | NOT NULL | |
| is_green_in_regulation | boolean | NOT NULL | |
| result | text | NOT NULL | |
| created_at | timestamp with time zone | | DEFAULT now() |