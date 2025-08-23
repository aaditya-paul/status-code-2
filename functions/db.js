import {db} from "../firebaseConfig";

export async function setInfoDB({uid, prompt}) {
  console.log("setting DB");
  try {
    await setDoc(doc(db, "users", uid), {
      prompt: prompt,
      uid: uid,
    });
    console.log("DB set successfully");
  } catch (error) {
    console.error("Error setting DB:", error);
  }
}
