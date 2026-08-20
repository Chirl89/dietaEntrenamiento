export function handleChatKeyPress(event) {
  if (event.key === "Enter") {
    sendChatMessage();
  }
}

export function sendChatMessage() {
  const input = document.getElementById("chat-input");
  if (!input) return;
  const text = input.value.trim();
  if (!text) return;

  const messagesBox = document.getElementById("chat-messages");
  if (!messagesBox) return;

  // User Message
  const userMsg = document.createElement("div");
  userMsg.className = "chat-bubble user";
  userMsg.innerText = text;
  messagesBox.appendChild(userMsg);

  input.value = "";
  messagesBox.scrollTop = messagesBox.scrollHeight;

  // Generate bot reply
  setTimeout(() => {
    const botReply = generateBotReply(text.toLowerCase());
    const botMsg = document.createElement("div");
    botMsg.className = "chat-bubble bot";
    botMsg.innerHTML = botReply;
    messagesBox.appendChild(botMsg);
    messagesBox.scrollTop = messagesBox.scrollHeight;
  }, 400);
}

export function generateBotReply(query) {
  if (query.includes("10 años") || query.includes("paron") || query.includes("sedentario") || query.includes("empezar")) {
    return "💡 <strong>Consejo de Reactivación para Carlos:</strong> Tras 10 años sin hacer ejercicio, la clave no es la intensidad bruta, sino la <em>consistencia</em>. Empieza haciendo la Rutina 1 tres veces por semana. Escuchad a vuestras articulaciones y aseguraos de beber al menos 2.5L de agua al día.";
  }
  if (query.includes("boo") || query.includes("border collie") || query.includes("perro") || query.includes("ruta")) {
    return "🐾 <strong>Entrenamiento con Boo:</strong> Los Border Collies como Boo responden genial a los cambios de ritmo. Prueba a intercalar 1 min de trote con 2 min de caminata en la Ruta 1. Mantendrás sus pulsaciones activas y las tuyas también.";
  }
  if (query.includes("suplemento") || query.includes("proteina") || query.includes("creatina")) {
    return "🥛 <strong>Sobre Suplementación:</strong> La proteína de suero (whey) es muy útil si os cuesta llegar a vuestro objetivo diario (155g / 130g). La creatina monohidrato (3-5g al día) también es excelente para la fuerza y recuperación muscular.";
  }
  if (query.includes("sustituir") || query.includes("cambiar") || query.includes("receta") || query.includes("comida")) {
    return "🥗 <strong>Sustitución de Alimentos:</strong> Podéis añadir cualquier alimento que no os guste en la sección de <em>Exclusiones</em> de la pestaña Perfil. La aplicación recalculará el menú y la lista de la compra al instante.";
  }
  if (query.includes("rodilla") || query.includes("dolor") || query.includes("espalda")) {
    return "⚠️ <strong>Cuidado Articular:</strong> Si sentís molestias en la rodilla en las sentadillas, usad una silla como apoyo y no bajéis más allá de los 90 grados. Mantened siempre el abdomen activado para proteger la zona lumbar.";
  }
  
  return "💪 ¡Gran pregunta! Recordad que el secreto de la recomposición corporal de Carlos y Andrea es mantener una ingesta de proteína adecuada, dormir 7-8 horas y no saltarse los paseos activos con Boo. ¡Seguid así!";
}
