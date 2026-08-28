const fs = require('fs');
let code = fs.readFileSync('src/context/AppContext.tsx', 'utf8');

const updatedUpdateCircle = `  const updateCircle = async (circleId: string, data: Partial<Pick<Circle, 'name' | 'description' | 'category' | 'avatar' | 'bannerGradient' | 'tags' | 'isPrivate' | 'meetingSchedule'>>) => {
    try {
      const token = localStorage.getItem('lingkar_auth_token');
      await fetch(\`/api/circles/\${circleId}\`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': \`Bearer \${token}\`
        },
        body: JSON.stringify(data)
      });
      setCircles((prev) =>
        prev.map((c) => {
          if (c.id === circleId) {
            return { ...c, ...data };
          }
          return c;
        })
      );
    } catch (err) {
      console.error('Failed to update circle', err);
    }
  };`;

const regex = /const updateCircle = async \(circleId: string, data: Partial<Pick<Circle, 'name' \| 'description' \| 'category' \| 'avatar' \| 'bannerGradient' \| 'tags' \| 'isPrivate' \| 'meetingSchedule'>>\) => \{[\s\S]*?\/\/ In a real app we would call backend API here\n  \};/;

code = code.replace(regex, updatedUpdateCircle);
fs.writeFileSync('src/context/AppContext.tsx', code);
