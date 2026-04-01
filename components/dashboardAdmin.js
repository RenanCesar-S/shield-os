import { truncateUsername, delay, showToast } from "./utils.js";
import * as el from "./ui-elements.js";
import { loadFromDatabase, postToDatabase } from "../databases/database.js";
import { navigateTo } from "./auth.js";

let systemUsers = []; // Agora armazena os usuários da API
let isFiltered = false; // Estado do filtro de bloqueados

// 1. CARREGAR DADOS REAIS
export async function loadDashboardReport() {
  try {
    el.loader.classList.remove("hidden");

    // Puxa os usuários vivos do banco
    const usersData = await loadFromDatabase("users");
    if (!usersData) throw new Error("No users found in database.");

    // Converte o objeto da API em Array
    systemUsers = Object.keys(usersData).map((id) => ({
      id,
      ...usersData[id],
    }));

    renderLiveUserTable(systemUsers);
    setupAdminListeners();
  } catch (error) {
    el.dashboardArea.innerHTML = `<p style="color: orange;">Error: ${error.message}<p>`;
  } finally {
    el.loader.classList.add("hidden");
  }
}

// 2. RENDERIZAR TABELA COM AÇÕES (DELETE, BLOCK, INV)
function renderLiveUserTable(users) {
  let tableHTML = `
    <h3>Active Players Control</h3>
    <table>
        <thead>
            <tr>
                <th>Player</th>
                <th>Level</th>
                <th>Points</th>
                <th>Status</th>
                <th>Actions</th>
            </tr>
        </thead>
        <tbody>
    `;

  users.forEach((user) => {
    const isLocked = user.status === "blocked";
    const commonInfos = `
    <td>${truncateUsername(user.username) || "Unknown"}</td>
    <td>${user.level || 1}</td>
    <td>${user.points || 0} pts</td>
    <td class="${isLocked ? "status-locked" : "status-active"}">
        ${isLocked ? "BLOCKED" : "ACTIVE"}
    </td>
`;

    const actionColumn =
      user.id == 1
        ? `<td><p style="color: #888;">No actions for Admin</p></td>`
        : `<td>
        <button data-id="${user.id}" data-action="inventory">👤🎒</button>
        <button data-id="${user.id}" data-action="toggle" data-locked="${isLocked}">${isLocked ? "👤🔒" : "👤🔓"}</button>
        <button data-id="${user.id}" data-username="${user.username}" data-action="delete" style="color: #ff4444;">👤❌</button>
       </td>`;

    tableHTML += `
            <tr>
            ${commonInfos}${actionColumn}
            </tr>
  `;
  });

  tableHTML += `</tbody></table>`;
  el.dashboardArea.innerHTML = tableHTML;
}

// --- NOVAS FUNÇÕES DE CONTROLE (AS QUE FALTAVAM) ---

async function handleDeletePlayer(id, username) {
  if (id == 1) {
    showToast("You cannot delete the main admin account.", "error");
    return;
  }

  const btnConfirm = document.getElementById("btnConfirmDelete");
  const btnCancel = document.getElementById("btnCancelDelete");

  el.nameSpan.innerText = username.toUpperCase();
  el.Deletemodal.style.display = "flex";

  // Remove ouvintes antigos para não deletar o cara errado depois!
  const newBtnConfirm = btnConfirm.cloneNode(true);
  btnConfirm.parentNode.replaceChild(newBtnConfirm, btnConfirm);

  // Botão Cancelar
  btnCancel.onclick = () => (el.Deletemodal.style.display = "none");

  // Botão Confirmar
  newBtnConfirm.onclick = async () => {
    el.Deletemodal.style.display = "none";

    // Sua lógica original bonitinha:
    await postToDatabase(`users/${id}`, null, "DELETE");
    loadDashboardReport();

    // Opcional: Um feedback visual de sucesso
    showToast(`Agent ${username} has been deleted.`, "success");
  };
}

export async function toggleUserStatus(id, currentStatus) {
  if (id == 1) {
    showToast("You cannot change the status of the main admin account.", "error");
    return;
  }
  const newStatus = currentStatus ? "active" : "blocked";
  await postToDatabase(`users/${id}`, { status: newStatus }, "PUT");
  if (isFiltered) toggleLockedFilter();

  loadDashboardReport(); // Refresh
}

function showInventoryModal(user) {
  const ITEM_NAMES = {
    bg_colorfulMode: "Colorful Mode",
    golden_name: "Golden Name",
    high_xp: "High XP Gain",
  };

  const modal = el.inventoryModal;
  const list = document.getElementById("inventory-list");
  const closeBtn = document.querySelector(".close-modal");

  // Limpa a lista anterior
  list.innerHTML = "";

  // Verifica se tem itens
  if (user.inventory && user.inventory.length > 0) {
    user.inventory.forEach((item) => {
      const itemDiv = document.createElement("div");
      itemDiv.classList.add("inventory-item");
      const displayName = ITEM_NAMES[item] || item;
      itemDiv.innerHTML = `<span>⚡ ${displayName}</span>`;
      list.appendChild(itemDiv);
    });
  } else {
    list.innerHTML = '<p style="color: #666;">Inventory is empty.</p>';
  }

  // Abre o modal
  modal.style.display = "flex";

  // Fecha no X
  closeBtn.onclick = () => (modal.style.display = "none");

  // Fecha se clicar fora do modal
  window.onclick = (event) => {
    if (event.target == modal) modal.style.display = "none";
  };
}

export function viewInventory(id) {
  const user = systemUsers.find((u) => u.id === id);
  if (id == 1) {
    showToast("The main admin account does not have an inventory.", "info");
    return;
  }
  showInventoryModal(user);
}

function setupAdminListeners() {
  const table = el.dashboardArea;

  // Remove ouvintes antigos para não duplicar se a função for chamada de novo
  table.onclick = async (e) => {
    // Busca o botão mais próximo do clique (caso clique no emoji dentro do botão)
    const btn = e.target.closest("button");
    if (!btn) return;

    const id = btn.dataset.id;
    const action = btn.dataset.action;
    const username = btn.dataset.username; // Para o delete

    // Switch Case: O jeito mais elegante de organizar as ações
    switch (action) {
      case "inventory":
        viewInventory(id);
        break;
      case "toggle":
        const isLocked = btn.dataset.locked === "true";
        toggleUserStatus(id, isLocked);
        break;
      case "delete":
        handleDeletePlayer(id, username);
        break;
    }
  };
}

// Filtra o array original e retorna um novo só com os bloqueados
export function getLockedUsers() {
  return systemUsers.filter((user) => user.status === "blocked");
}

export async function toggleLockedFilter() {
  try {
    el.loader.classList.remove("hidden");
    if (!systemUsers || systemUsers.length === 0) return;

    // Inverte o estado do filtro (isFiltered é aquela let que temos no topo do arquivo)
    isFiltered = !isFiltered;

    if (isFiltered) {
      const lockedList = getLockedUsers();

      if (lockedList.length === 0) {
        showToast("No blocked agents found.", "info");
        isFiltered = false; // Reseta porque não tem o que filtrar
        return;
      }

      renderLiveUserTable(lockedList);
      el.btnOnlyLocked.textContent = "Show All Players";
      el.btnOnlyLocked.classList.add("active-filter"); // Dica: mude a cor no CSS
      el.loader.classList.add("hidden");
      localStorage.setItem("isFiltered", "true"); // Salva o estado do filtro
    } else {
      // Se desligou o filtro, mostra a lista completa original
      renderLiveUserTable(systemUsers);
      el.btnOnlyLocked.textContent = "Show Only Locked";
      el.btnOnlyLocked.classList.remove("active-filter");
      el.loader.classList.add("hidden");
      localStorage.setItem("isFiltered", "false");
    }
  } catch (error) {
    console.error("Error occurred while filtering users:", error);
  } finally {
    await delay(500);
    el.loader.classList.add("hidden");
  }
}

// Mantenha seu logoutAdmin e searchUser (ajustando a busca para systemUsers)
export async function logoutAdmin() {
  const id = localStorage.getItem("userID");

  try {
    // 1. Avisa a API que a sessão encerrou (Segurança de verdade)
    if (id) {
      await postToDatabase(`users/${id}`, { sessionToken: "" }, "PUT");
    }
  } catch (error) {
    console.error("API logout failed, clearing local session anyway...");
  } finally {
    // 2. Limpa TUDO que identifica o Admin no navegador
    localStorage.removeItem("authenticated");
    localStorage.removeItem("sessionToken");
    localStorage.removeItem("userID");
    localStorage.removeItem("userName");
    localStorage.removeItem("isFiltered");
    el.container.classList.remove("container-for-dashboard");
  }
  navigateTo("loginSection");
}

export function searchUser() {
  const onlyLocked = localStorage.getItem("isFiltered") === "true";

  // 1. Pega o que foi digitado (em minúsculo para não dar erro de busca)
  const searchTerm = el.iptSearch.value.toLowerCase();

  // 2. Filtra a nossa lista de usuários que já está na memória (systemUsers)
  const filteredList = systemUsers.filter((user) => user.username.toLowerCase().includes(searchTerm));
  const lockedList = getLockedUsers();

  // Se o filtro de bloqueados estiver ativo, filtra a lista de bloqueados também
  const finalList = onlyLocked
    ? filteredList.filter((user) => lockedList.some((locked) => locked.id === user.id))
    : filteredList;

  // 3. Se não achar ninguém, avisa o Admin
  if (finalList.length === 0) {
    el.dashboardArea.innerHTML = `
      <div class="no-results">
        <p>No players found with the Username: "<strong>${searchTerm}</strong>"</p>
        <button>Clear Search</button>
      </div>
    `;

    const btn = document.querySelector(".no-results button");
    btn.addEventListener("click", () => {
      if (isFiltered) toggleLockedFilter(); // Se estava filtrado, reseta para mostrar tudo
      el.iptSearch.value = "";
      loadDashboardReport();
    });
    return;
  }

  // 4. Se achar, renderiza a tabela apenas com os filtrados
  renderLiveUserTable(finalList);
}
