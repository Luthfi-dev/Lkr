const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

// Replace the line extracting fields
code = code.replace(
  'const { name, code, description, category, bannerGradient, isPrivate, meetingSchedule, adminId, creatorName, creatorAvatar } = req.body;',
  'const { name, code, description, category, bannerGradient, isPrivate, meetingSchedule, adminId, creatorName, creatorAvatar, avatar, tags } = req.body;'
);

// Update SQL Insert
code = code.replace(
  'INSERT INTO circles (id, name, code, description, category, banner_gradient, admin_id, kas_balance, is_private, meeting_schedule, created_at)',
  'INSERT INTO circles (id, name, code, description, category, banner_gradient, avatar, tags, admin_id, kas_balance, is_private, meeting_schedule, created_at)'
);
code = code.replace(
  'meetingSchedule || null\n        ]);',
  "meetingSchedule || null,\n          avatar || '',\n          JSON.stringify(tags || [])\n        ]);" // Note this replacement depends on exact spacing. I'll use regex.
);

fs.writeFileSync('server.ts', code);
