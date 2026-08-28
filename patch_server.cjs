const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const putCode = `
  app.put('/api/circles/:id', async (req, res) => {
    try {
      const circleId = req.params.id;
      const { name, description, category, avatar, bannerGradient, tags, isPrivate, meetingSchedule } = req.body;
      
      if (mysqlPool && dbStatus.connected) {
        let updateQuery = 'UPDATE circles SET ';
        const updateValues = [];
        if (name !== undefined) { updateQuery += 'name = ?, '; updateValues.push(name); }
        if (description !== undefined) { updateQuery += 'description = ?, '; updateValues.push(description); }
        if (category !== undefined) { updateQuery += 'category = ?, '; updateValues.push(category); }
        if (avatar !== undefined) { updateQuery += 'avatar = ?, '; updateValues.push(avatar); }
        if (bannerGradient !== undefined) { updateQuery += 'banner_gradient = ?, '; updateValues.push(bannerGradient); }
        if (tags !== undefined) { updateQuery += 'tags = ?, '; updateValues.push(JSON.stringify(tags)); }
        if (isPrivate !== undefined) { updateQuery += 'is_private = ?, '; updateValues.push(isPrivate ? 1 : 0); }
        if (meetingSchedule !== undefined) { updateQuery += 'meeting_schedule = ?, '; updateValues.push(meetingSchedule); }
        
        // Remove trailing comma and space
        updateQuery = updateQuery.slice(0, -2);
        updateQuery += ' WHERE id = ?';
        updateValues.push(circleId);
        
        if (updateValues.length > 1) {
          await mysqlPool.query(updateQuery, updateValues);
        }
        return res.json({ success: true });
      }

      const circle = inMemoryCircles.find(c => c.id === circleId);
      if (circle) {
        if (name !== undefined) circle.name = name;
        if (description !== undefined) circle.description = description;
        if (category !== undefined) circle.category = category;
        if (avatar !== undefined) circle.avatar = avatar;
        if (bannerGradient !== undefined) circle.bannerGradient = bannerGradient;
        if (tags !== undefined) circle.tags = tags;
        if (isPrivate !== undefined) circle.isPrivate = isPrivate;
        if (meetingSchedule !== undefined) circle.meetingSchedule = meetingSchedule;
      }
      res.json({ success: true });
    } catch (err) {
      res.status(500).json({ error: 'Gagal memperbarui grup: ' + err.message });
    }
  });
`;

code = code.replace("app.delete('/api/circles/:id'", putCode.trim() + "\n\n  app.delete('/api/circles/:id'");
fs.writeFileSync('server.ts', code);
