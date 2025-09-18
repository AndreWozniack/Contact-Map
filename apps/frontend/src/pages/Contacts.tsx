import { useState } from "react";
import {
  Container,
  Box,
  LinearProgress,
  Paper,
  Snackbar,
} from "@mui/material";

import {
  Header,
  SearchBar,
  Filters,
  List,
  ContactMap,
  Dialogs,
  SettingsMenu,
  DeleteAccountDialog,
} from "../components/contacts";

import type { Contact } from "../types";
import { api } from "../lib/api";

import { useContacts } from "../hooks/useContacts";
import { useSelectedContact } from "../hooks/useSelectedContact";
import { useClipboard } from "../hooks/useClipboard";

/**
 * Página principal de gerenciamento de contatos
 * 
 * Interface principal da aplicação onde usuários podem:
 * - Visualizar lista de contatos com busca e filtros
 * - Ver contatos em mapa interativo
 * - Adicionar, editar e excluir contatos
 * - Gerenciar dados do perfil
 * - Fazer logout da aplicação
 * 
 * @returns Componente da página de contatos
 */
export default function ContactsPage() {
  const {
    q,
    setQ,
    sort,
    setSort,
    dir,
    setDir,
    page,
    setPage,
    perPage,
    setPerPage,
    rows,
    setRows,
    totalPages,
    loading,
    fetchData,
    reset,
  } = useContacts();

  const { selectedId, setSelectedId, selected, listRef } =
    useSelectedContact(rows);

  const { copiedOpen, closeSnackbar, copyContact } = useClipboard();

  const [editing, setEditing] = useState<Contact | null>(null);
  const [openNew, setOpenNew] = useState(false);
  const [settingsEl, setSettingsEl] = useState<null | HTMLElement>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);

  function handleOpenSettings(event: React.MouseEvent<HTMLElement>) {
    setSettingsEl(event.currentTarget);
  }

  function handleCloseSettings() {
    setSettingsEl(null);
  }

  function handleEdit(c: Contact) {
    setEditing(c);
  }

  async function handleDelete(c: Contact) {
    const ok = confirm(`Apagar o contato "${c.name}"?`);
    if (!ok) return;
    await api.del<void>(`/contacts/${c.id}`);
    setRows((prev) => prev.filter((r) => r.id !== c.id));
    if (selectedId === c.id) setSelectedId(null);
  }

  const handleContactUpdated = (updated: Contact) => {
    setRows((prev) => prev.map((r) => (r.id === updated.id ? updated : r)));
    setEditing(null);
  };

  const handleContactCreated = (newContact: Contact) => {
    setRows((prev) => [newContact, ...prev]);
    setOpenNew(false);
  };

  return (
    <Box
      sx={{ height: "100dvh", display: "grid", gridTemplateRows: "auto 1fr" }}
    >
      <Header onOpenSettings={handleOpenSettings} />

      <SettingsMenu
        anchorEl={settingsEl}
        open={Boolean(settingsEl)}
        onClose={handleCloseSettings}
        onDeleteAccount={() => setConfirmOpen(true)}
      />

      <Container
        maxWidth={false}
        disableGutters
        sx={{ height: "100%", py: 1, px: 1 }}
      >
        <Box
          sx={{
            height: "100%",
            display: "grid",
            gridTemplateColumns: {
              xs: "1fr",
              md: "minmax(380px, 550px) minmax(0, 1fr)",
            },
            gap: 1,
            alignItems: "stretch",
          }}
        >
          {/* Lista de contatos e filtros */}
          <Box
            sx={{
              height: "100%",
              display: "grid",
              gridTemplateRows: "auto 1fr",
              minWidth: 0,
            }}
          >
            <SearchBar
              searchValue={q}
              onSearchChange={setQ}
              onNewContact={() => setOpenNew(true)}
              onPageChange={setPage}
            />

            {loading && <LinearProgress sx={{ mb: 1 }} />}
            
            <Paper sx={{ p: 1, mb: 1 }}>
              <Filters
                sort={sort}
                dir={dir}
                perPage={perPage}
                onSortChange={setSort}
                onDirChange={setDir}
                onPerPageChange={(value: number) => {
                  setPerPage(value);
                  setPage(1);
                }}
                onRefresh={fetchData}
                onReset={reset}
                onPageChange={setPage}
              />

              {/* Lista de contatos */}
              <List
                contacts={rows}
                selectedId={selectedId}
                loading={loading}
                page={page}
                totalPages={totalPages}
                listRef={listRef}
                onContactSelect={setSelectedId}
                onContactCopy={copyContact}
                onContactEdit={handleEdit}
                onContactDelete={handleDelete}
                onPageChange={setPage}
              />
            </Paper>
          </Box>

          {/* Mapa dos contatos */}
          <Box sx={{ height: "100%" }}>
            <Paper sx={{ p: 1, height: "100%", borderRadius: 2 }}>
              <Box sx={{ height: "100%", borderRadius: 2, overflow: "hidden" }}>
                <ContactMap
                  contacts={rows}
                  focus={
                    selected &&
                      typeof selected.lat === "number" &&
                      typeof selected.lng === "number"
                      ? {
                        id: selected.id,
                        name: selected.name,
                        lat: selected.lat!,
                        lng: selected.lng!,
                      }
                      : null
                  }
                  height="100%"
                  width="100%"
                />
              </Box>
            </Paper>
          </Box>
        </Box>
      </Container>

      <Dialogs
        editing={editing}
        openNew={openNew}
        onCloseEdit={() => setEditing(null)}
        onCloseNew={() => setOpenNew(false)}
        onContactUpdated={handleContactUpdated}
        onContactCreated={handleContactCreated}
      />

      <DeleteAccountDialog
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
      />

      <Snackbar
        open={copiedOpen}
        autoHideDuration={2000}
        onClose={closeSnackbar}
        message="Copiado!"
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      />
    </Box>
  );
}
