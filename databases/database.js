import { User } from "../components/User.js";
import { API_CONFIG } from "../env.js";

const API_URL = API_CONFIG.BASE_URL;

export const postToDatabase = async (endpoint, data, method = "POST") => {
  try {
    const response = await fetch(`${API_URL}${endpoint}`, {
      method: method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    if (!response.ok) throw new Error(`Failed to ${method} to ${endpoint}`);
    return await response.json();
  } catch (error) {
    console.error("❌ [Database Error]:", error.message);
    return null;
  }
};

export const loadFromDatabase = async (endpoint) => {
  try {
    const response = await fetch(`${API_URL}${endpoint}`);
    if (!response.ok) throw new Error("API Connection Failed");

    const savedData = await response.json();

    if (endpoint.includes("users")) {
      return savedData.map((u) => new User(u));
    }
    return savedData;
  } catch (error) {
    console.log("⚠️ [System]: Failed to load users, returning empty array.");
    return [];
  }
};
