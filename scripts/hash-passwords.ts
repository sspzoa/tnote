import bcrypt from "bcrypt";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function hashPasswords() {
  try {
    // 모든 사용자 조회
    const { data: users, error } = await supabase
      .from("Users")
      .select("id, phone_number, password");

    if (error) {
      console.error("Error fetching users:", error);
      return;
    }

    console.log(`Found ${users.length} users`);

    // 각 사용자의 비밀번호 해싱
    for (const user of users) {
      // 이미 해싱된 비밀번호인지 확인 (bcrypt 해시는 $2로 시작)
      if (user.password && user.password.startsWith("$2")) {
        console.log(`Skipping ${user.phone_number} - already hashed`);
        continue;
      }

      const hashedPassword = await bcrypt.hash(user.password, 10);

      const { error: updateError } = await supabase
        .from("Users")
        .update({ password: hashedPassword })
        .eq("id", user.id);

      if (updateError) {
        console.error(`Error updating ${user.phone_number}:`, updateError);
      } else {
        console.log(`✓ Hashed password for ${user.phone_number}`);
      }
    }

    console.log("Password hashing completed!");
  } catch (error) {
    console.error("Error:", error);
  }
}

hashPasswords();
