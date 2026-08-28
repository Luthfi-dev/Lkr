const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

// I'll just rewrite the POST /api/circles endpoint completely for safety
const regex = /app\.post\('\/api\/circles', async \(req, res\) => \{[\s\S]*?\/\/ ==========================================\n  \/\/ 5\. POSTS \& DISCUSSIONS API/m;

const newEndpoint = `app.post('/api/circles', async (req, res) => {
    try {
      const { name, code, description, category, bannerGradient, isPrivate, meetingSchedule, adminId, creatorName, creatorAvatar, avatar, tags } = req.body;
      if (!name) {
        return res.status(400).json({ error: 'Nama lingkar/grup wajib diisi.' });
      }

      const circleId = \`circle_\${Date.now()}_\${crypto.randomBytes(2).toString('hex')}\`;
      const circleCode = code || \`\${name.slice(0, 4).toUpperCase()}-\${Math.floor(100 + Math.random() * 900)}\`;
      const finalAdminId = adminId || 'usr_1';

      if (mysqlPool && dbStatus.connected) {
        await mysqlPool.query(\`
          INSERT INTO circles (id, name, code, description, category, banner_gradient, avatar, tags, admin_id, kas_balance, is_private, meeting_schedule, created_at)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 0, ?, ?, NOW())
        \`, [
          circleId,
          name,
          circleCode,
          description || '',
          category || 'Komunitas Umum',
          bannerGradient || 'from-teal-600 to-emerald-800',
          avatar || '',
          JSON.stringify(tags || []),
          finalAdminId,
          isPrivate ? 1 : 0,
          meetingSchedule || null
        ]);

        await mysqlPool.query(\`
          INSERT INTO circle_members (id, circle_id, user_id, role, contribution_points, joined_at)
          VALUES (?, ?, ?, 'Ketua', 100, NOW())
        \`, [\`cm_\${Date.now()}\`, circleId, finalAdminId]);

        const [rows] = await mysqlPool.query('SELECT * FROM circles WHERE id = ?', [circleId]);
        const [members] = await mysqlPool.query('SELECT * FROM circle_members WHERE circle_id = ?', [circleId]);
        
        return res.status(201).json({
          success: true,
          circle: {
            ...rows[0],
            tags: typeof rows[0].tags === 'string' ? JSON.parse(rows[0].tags) : [],
            isPrivate: Boolean(rows[0].is_private),
            members: members.map((m: any) => ({
              id: m.user_id,
              name: creatorName || 'Pembuat Grup',
              avatar: creatorAvatar || 'https://api.dicebear.com/7.x/avataaars/svg?seed=Admin',
              role: m.role,
              contributionPoints: m.contribution_points,
              joinedAt: m.joined_at
            }))
          }
        });
      }

      // IN-MEMORY FALLBACK
      const newCircle = {
        id: circleId,
        name,
        code: circleCode,
        description: description || '',
        category: category || 'Komunitas Umum',
        avatar: avatar || 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=800&q=80',
        bannerGradient: bannerGradient || 'from-teal-600 to-emerald-800',
        adminId: finalAdminId,
        kasBalance: 0,
        tags: tags || [],
        isPrivate: !!isPrivate,
        meetingSchedule,
        createdAt: new Date().toISOString(),
        members: [{
          id: finalAdminId,
          name: creatorName || 'Pembuat Grup',
          avatar: creatorAvatar || 'https://api.dicebear.com/7.x/avataaars/svg?seed=Admin',
          role: 'Ketua',
          contributionPoints: 100,
          joinedAt: new Date().toISOString()
        }]
      };

      inMemoryCircles.push(newCircle as any);
      res.status(201).json({ success: true, circle: newCircle });
    } catch (err: any) {
      res.status(500).json({ error: 'Gagal membuat grup: ' + err.message });
    }
  });

  app.post('/api/circles/join-by-code', async (req, res) => {
    // keeping join-by-code unmodified
    try {
      const { code } = req.body;
      const userId = 'usr_1'; 
      
      let circle;
      if (mysqlPool && dbStatus.connected) {
        const [rows] = await mysqlPool.query('SELECT * FROM circles WHERE code = ?', [code]);
        if ((rows as any[]).length === 0) {
          return res.status(404).json({ success: false, message: 'Kode undangan tidak valid.' });
        }
        
        const circleData = (rows as any[])[0];
        
        const [existing] = await mysqlPool.query('SELECT * FROM circle_members WHERE circle_id = ? AND user_id = ?', [circleData.id, userId]);
        if ((existing as any[]).length > 0) {
           return res.json({ success: false, message: 'Anda sudah menjadi anggota grup ini.' });
        }
        
        await mysqlPool.query(
          'INSERT INTO circle_members (id, circle_id, user_id, role, contribution_points, joined_at) VALUES (?, ?, ?, ?, ?, NOW())',
          [\`cm_\${Date.now()}\`, circleData.id, userId, 'Anggota', 0]
        );
        
        return res.json({
          success: true,
          circle: {
            ...circleData,
            tags: typeof circleData.tags === 'string' ? JSON.parse(circleData.tags) : circleData.tags,
            isPrivate: Boolean(circleData.is_private)
          },
          message: \`Berhasil bergabung dengan \${circleData.name}\`
        });
      }

      circle = inMemoryCircles.find(c => c.code === code);
      if (!circle) {
        return res.status(404).json({ success: false, message: 'Kode undangan tidak valid.' });
      }

      const isMember = circle.members.some(m => m.id === userId);
      if (isMember) {
        return res.json({ success: false, message: 'Anda sudah menjadi anggota grup ini.' });
      }

      circle.members.push({
        id: userId,
        name: 'You (Dev)',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=You',
        role: 'Anggota',
        contributionPoints: 0,
        joinedAt: new Date().toISOString()
      });

      res.json({ success: true, circle, message: \`Berhasil bergabung dengan \${circle.name}\` });
    } catch (err: any) {
      res.status(500).json({ error: 'Terjadi kesalahan sistem: ' + err.message });
    }
  });

  app.post('/api/circles/:id/leave', async (req, res) => {
    try {
      const circleId = req.params.id;
      const userId = 'usr_1';

      if (mysqlPool && dbStatus.connected) {
         await mysqlPool.query('DELETE FROM circle_members WHERE circle_id = ? AND user_id = ?', [circleId, userId]);
         return res.json({ success: true });
      }

      const circle = inMemoryCircles.find(c => c.id === circleId);
      if (circle) {
        circle.members = circle.members.filter(m => m.id !== userId);
      }
      res.json({ success: true });
    } catch (err: any) {
       res.status(500).json({ error: err.message });
    }
  });

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
    } catch (err: any) {
      res.status(500).json({ error: 'Gagal memperbarui grup: ' + err.message });
    }
  });

  app.delete('/api/circles/:id', async (req, res) => {
    try {
      const circleId = req.params.id;
      if (mysqlPool && dbStatus.connected) {
        await mysqlPool.query('DELETE FROM circle_members WHERE circle_id = ?', [circleId]);
        await mysqlPool.query('DELETE FROM tasks WHERE circle_id = ?', [circleId]);
        await mysqlPool.query('DELETE FROM posts WHERE circle_id = ?', [circleId]);
        await mysqlPool.query('DELETE FROM financial_transactions WHERE circle_id = ?', [circleId]);
        await mysqlPool.query('DELETE FROM circles WHERE id = ?', [circleId]);
        return res.json({ success: true });
      }

      inMemoryCircles = inMemoryCircles.filter((c) => c.id !== circleId);
      res.json({ success: true });
    } catch (err: any) {
      res.status(500).json({ error: 'Gagal menghapus grup: ' + err.message });
    }
  });

  // ==========================================
  // 5. POSTS & DISCUSSIONS API`;

code = code.replace(regex, newEndpoint);
fs.writeFileSync('server.ts', code);
