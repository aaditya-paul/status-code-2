import {doc, setDoc} from "@firebase/firestore";
import {db} from "../firebaseConfig.js";

export async function setChatDB({uid, text, script, scriptToken, chatID}) {
  console.log("setting DB");
  console.log(uid);

  try {
    await setDoc(doc(db, "chats", chatID), {
      prompt: text,
      uid: uid,
      script: script,
      scriptToken: scriptToken,
    }).then(() => {
      console.log("DB set successfully");
      return {
        success: true,
        message: "DB set successfully",
      };
    });
  } catch (error) {
    console.error("Error setting DB:", error);
    return {
      success: false,
      message: "Error setting DB",
    };
  }
}
