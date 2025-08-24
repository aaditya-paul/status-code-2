import {doc, setDoc, updateDoc} from "@firebase/firestore";
import {db} from "../firebaseConfig.js";

export async function setChatDB({
  uid,
  text,
  script,
  scriptToken,
  chatID,
  readyToken,
}) {
  console.log("setting DB");
  console.log(uid);
  console.log(script);

  try {
    await setDoc(doc(db, "chats", chatID), {
      prompt: text,
      uid: uid,
      scripts: script ? [script] : [],
      scriptTokens: scriptToken,
      readyTokens: readyToken ? [readyToken] : [],
      chatID: chatID,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
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

export async function updateChatDB({chatID, script, readyToken}) {
  console.log("updating DB with new script");
  console.log(chatID, readyToken);

  try {
    const chatRef = doc(db, "chats", chatID);
    await updateDoc(chatRef, {
      scripts: script,
      readyTokens: readyToken,
      updatedAt: new Date().toISOString(),
    });

    console.log("DB updated successfully");
    return {
      success: true,
      message: "DB updated successfully",
    };
  } catch (error) {
    console.error("Error updating DB:", error);
    return {
      success: false,
      message: "Error updating DB",
    };
  }
}
