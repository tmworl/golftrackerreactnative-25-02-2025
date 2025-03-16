Database Overview
Purpose
The database for the golf score tracking app is designed to manage user data, golf courses, rounds, and shots. It allows users to track their golf performance by recording shots by type and outcome for each hole of a round.
Main Entities

Users: Represents the users of the application.
Courses: Represents the golf courses where rounds are played.
Rounds: Represents individual rounds played by users.
Shots: Represents the shots taken during each round.

Database Design Principles

Normalization: The database is normalized to reduce redundancy and improve data integrity.
Referential Integrity: Foreign key constraints are used to maintain relationships between tables.
Row Level Security: RLS policies are implemented to ensure data privacy and security for user-specific data.

PostgreSQL Features Utilized

UUIDs: Used for user identification to ensure unique user profiles.
Row Level Security: To control access to data based on user authentication.
Triggers and Functions: For automated actions and data validation.