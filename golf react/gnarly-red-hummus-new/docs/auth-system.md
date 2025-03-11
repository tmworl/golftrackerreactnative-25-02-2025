# Authentication System and Row Level Security Policies

## Enabled Auth Providers
- Email/Password

## Row Level Security Policies

### Users Table
- **Policy Name**: Allow user access
- **Operation**: SELECT
- **Definition**: `profile_id = auth.uid()`

### Rounds Table
- **Policy Name**: Allow read rounds for owner
- **Operation**: SELECT
- **Definition**: `profile_id = auth.uid()`

- **Policy Name**: Allow insert rounds for owner
- **Operation**: INSERT
- **Definition**: `profile_id = auth.uid()`

### Shots Table
- **Policy Name**: Allow read shots for owner
- **Operation**: SELECT
- **Definition**: `EXISTS (SELECT 1 FROM rounds WHERE rounds.id = shots.round_id AND rounds.profile_id = auth.uid())`

- **Policy Name**: Allow insert shots for owner
- **Operation**: INSERT
- **Definition**: `EXISTS (SELECT 1 FROM rounds WHERE rounds.id = shots.round_id AND rounds.profile_id = auth.uid())`