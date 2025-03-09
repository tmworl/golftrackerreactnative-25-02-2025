# analyze-golf-performance Function

## Purpose
The `analyze-golf-performance` function is designed to generate AI-driven insights based on a user's golf performance. It analyzes data from completed rounds and provides personalized feedback to help users improve their game. The insights are stored in the `insights` table, allowing users to view and provide feedback on the generated content.

## Contents

### Table Structure
The function interacts with the following table:

#### insights Table
- **id**: `UUID`
  - Unique identifier for each insight record, automatically generated using `gen_random_uuid()`.
  
- **profile_id**: `UUID`
  - Links to the user who owns this insight. This field is required and references the `id` column in the `auth.users` table.

- **round_id**: `UUID`
  - Links to the specific round this insight is about. This can be `NULL` if the insight isn't tied to a specific round. It references the `id` column in the `rounds` table.

- **insights**: `JSONB`
  - Contains the actual AI-generated insights stored in a binary JSON format. This field is required.

- **created_at**: `TIMESTAMPTZ`
  - Automatically set to the current time when the insight is created.

- **feedback_rating**: `SMALLINT`
  - User feedback on how helpful the insight was. Possible values are:
    - `NULL`: No feedback yet
    - `1`: Not helpful
    - `2`: Somewhat helpful
    - `3`: Very helpful

### Function Logic
The `analyze-golf-performance` function may include the following logic:

1. **Input Parameters**:
   - `profile_id`: The UUID of the user for whom the insights are being generated.
   - `round_id`: The UUID of the specific round being analyzed (optional).
   - `performance_data`: A JSON object containing relevant performance metrics from the user's rounds (e.g., scores, shot types, outcomes).

2. **Data Retrieval**:
   - The function retrieves relevant data from the `rounds` and `shots` tables based on the provided `profile_id` and `round_id`.
   - It may aggregate data to calculate averages, such as average score per hole, fairway hit percentage, and greens in regulation.

3. **AI Analysis**:
   - The function applies AI algorithms or heuristics to analyze the performance data.
   - It generates insights based on patterns identified in the user's performance, such as common mistakes, strengths, and areas for improvement.

4. **Insert Insights**:
   - The generated insights are formatted as a JSON object and inserted into the `insights` table.
   - The function sets the `profile_id`, `round_id`, and `insights` fields accordingly.

5. **Return Value**:
   - The function may return the newly created insight record or a success message indicating that the insights were generated successfully.

### Row Level Security (RLS)
The function ensures data privacy by enabling Row Level Security on the `insights` table. This restricts access to insights based on user policies.

#### Policies
- **Users can view their own insights**: Allows users to see only their own insights based on their `profile_id`.
  
- **Users can update their own insights**: Allows users to provide feedback on insights they own.

- **Service can insert insights**: Allows the service role to insert insights for any user, which is necessary for the function to operate correctly.

### Example Code Snippet
Here is a simplified example of what the function code might look like:

```sql
CREATE OR REPLACE FUNCTION analyze_golf_performance(profile_id UUID, round_id UUID)
RETURNS VOID AS $$
DECLARE
    performance_data JSONB;
    generated_insights JSONB;
BEGIN
    -- Retrieve performance data for the user
    SELECT jsonb_agg(shots) INTO performance_data
    FROM shots
    WHERE round_id = round_id;

    -- Analyze performance data and generate insights
    generated_insights := generate_insights(performance_data);

    -- Insert the generated insights into the insights table
    INSERT INTO insights (profile_id, round_id, insights)
    VALUES (profile_id, round_id, generated_insights);
END;
$$ LANGUAGE plpgsql;