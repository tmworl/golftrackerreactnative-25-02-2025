# Relationships

## Foreign Key Relationships
| Source Table | Source Column | Referenced Table | Referenced Column | Relationship Type | ON DELETE Behavior | Validation Constraints |
|--------------|---------------|------------------|-------------------|-------------------|--------------------|-----------------------|
| rounds | profile_id | users | id | Many-to-One | Restrict | Must exist in users |
| rounds | course_id | courses | id | Many-to-One | Restrict | Must exist in courses |
| shots | round_id | rounds | id | Many-to-One | Cascade | Must exist in rounds |