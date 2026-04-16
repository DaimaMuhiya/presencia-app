"use server";

export async function loginAction(formData: FormData) {
  void formData.get("email");
  void formData.get("password");
  // TODO: brancher l’API d’authentification
}
