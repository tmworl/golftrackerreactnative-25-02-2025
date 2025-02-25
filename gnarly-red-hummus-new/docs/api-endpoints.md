# API Endpoints

## Common Query Patterns

### Users
- **Get User Profile**
```javascript
const { data, error } = await supabase
  .from('users')
  .select('*')
  .eq('id', userId);
```

- **Create User**
```javascript
const { data, error } = await supabase
  .from('users')
  .insert([
    { name: 'John Doe', email: 'john@example.com' }
  ]);
```

### Courses
- **Get All Courses**
```javascript
const { data, error } = await supabase
  .from('courses')
  .select('*');
```

- **Create a New Course**
```javascript
const { data, error } = await supabase
  .from('courses')
  .insert([
    { name: 'Pebble Beach', location: 'California' }
  ]);
```

### Rounds
- **Create a New Round**
```javascript
const { data, error } = await supabase
  .from('rounds')
  .insert([
    {
      profile_id: userId,
      course_id: courseId,
      score: initialScore,
      date: new Date()
    }
  ]);
```

- **Get Rounds for a User**
```javascript
const { data, error } = await supabase
  .from('rounds')
  .select('*')
  .eq('profile_id', userId);
```

### Shots
- **Record a New Shot**
```javascript
const { data, error } = await supabase
  .from('shots')
  .insert([
    {
      round_id: roundId,
      hole_number: holeNumber,
      shot_type: shotType,
      is_fairway_hit: isFairwayHit,
      is_green_in_regulation: isGreenInRegulation,
      result: shotResult
    }
  ]);
```

- **Get Shots for a Round**
```javascript
const { data, error } = await supabase
  .from('shots')
  .select('*')
  .eq('round_id', roundId);
```