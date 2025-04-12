"use client";

import { useRouter } from "next/navigation";
import { useEffect } from 'react';

export default function Login() {
    const router = useRouter();

    useEffect(() => {
        router.push('/projects');
    }, [router]);

  return (
      <div>
          <p>Loading...</p>
      </div>
  );
}


