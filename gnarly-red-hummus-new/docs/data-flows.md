# Data Flows

## User Registration and Profile Creation
1. User submits registration form with email and password.
2. The app calls the Supabase API to create a new user in the `users` table.
3. Upon successful registration, a new profile is created, and the user is authenticated.

## Starting a New Round
1. User selects a course and initiates a new round.
2. The app calls the Supabase API to insert a new record into the `rounds` table with the user's profile ID, course ID, and initial score.
3. The round is assigned a unique ID for tracking shots.

## Recording Shots During a Round
1. As the user plays, they record each shot taken for each hole.
2. For each shot, the app calls the Supabase API to insert a new record into the `shots` table, linking it to the current round ID.
3. The shot details include hole number, shot type (drive, iron, chip, putt), outcome (Good, Neutral, Bad), and whether it hit the fairway or reached the green in regulation.

## Completing a Round
1. Once the round is finished, the user submits their final score.
2. The app updates the corresponding record in the `rounds` table with the final score and completion date.
3. The user can then view their performance metrics and insights based on the recorded shots.

## Viewing Historical Performance
1. The user navigates to their performance history section.
2. The app calls the Supabase API to fetch all rounds associated with the user's profile ID.
3. The app aggregates the data to display average scores, fairway hit percentages, greens in regulation, and other performance metrics.
4. Insights and recommendations are generated using the AI API based on the historical data.