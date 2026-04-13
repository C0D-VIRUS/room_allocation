# Database Notes

Recommended implementation notes for the project:

- Keep `complaints.room_id` directly on the complaint table, so a separate `RELATED_TO` table is not required.
- Use one `allocations` table for room assignment and stay history by storing `start_date`, `end_date`, and `status`.
- Keep `preferences` and `lifestyle` as one-to-one tables keyed by `student_id`.
- Use enum-like constrained values in application code for statuses and categories.

