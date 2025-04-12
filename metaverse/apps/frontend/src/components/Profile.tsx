// src/pages/Profile.tsx
import { useEffect, useState } from 'react';
import {instance} from '../api/axios'; // 👈 import the instance

const Profile = () => {
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    instance.get('/user/currentUser') // 👈 it will auto-attach token
      .then(res => setUser(res.data))
      .catch(err => console.error('Error fetching user:', err));
  }, []);

  if (!user) return <div>Loading...</div>;

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold">Welcome, {user.username}!</h2>
      <p>Role: {user.type}</p>
    </div>
  );
};

export default Profile;
