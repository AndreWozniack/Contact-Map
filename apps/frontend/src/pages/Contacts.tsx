import { useState } from "react";
import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Container,
  InputAdornment,
  Select,
  MenuItem,
  ToggleButtonGroup,
  ToggleButton,
  Pagination,
  Stack,
  Box,
  LinearProgress,
  Button,
  Paper,
  TextField,
  Divider,
  Snackbar,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import SearchIcon from "@mui/icons-material/Search";
import RefreshIcon from "@mui/icons-material/Refresh";
import LogoutIcon from "@mui/icons-material/Logout";
import { useAuth } from "../hooks/useAuth";
import SettingsIcon from '@mui/icons-material/Settings';

import ContactCard from "../components/ContactCard";
import ContactsMap from "../components/ContactsMap.tsx";
import ContactDialog from "../components/ContactDialog";
import type { Contact } from "../types";
import { api } from "../lib/api";

import { useContacts } from "../hooks/useContacts";
import { useSelectedContact } from "../hooks/useSelectedContact.ts";
import { useClipboard } from "../hooks/useClipboard";

export default function ContactsPage() {
  const { user, logout } = useAuth();

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

  function handleEdit(c: Contact) {
    setEditing(c);
  }

  async function handleDelete(c: Contact) {
    const ok = confirm(`Apagar o contato “${c.name}”?`);
    if (!ok) return;
    await api.del<void>(`/contacts/${c.id}`);
    setRows((prev) => prev.filter((r) => r.id !== c.id));
    if (selectedId === c.id) setSelectedId(null);
    // TODO: Snackbar “Contato apagado”
    
  }

  return (
    <Box
      sx={{ height: "100dvh", display: "grid", gridTemplateRows: "auto 1fr" }}
    >
      <AppBar
        position="static"
        color="default"
        elevation={0}
        sx={{ borderBottom: 1, borderColor: "divider" }}
      >
        <Toolbar sx={{ gap: 1 }}>
          <Typography variant="h4" sx={{ flex: 1, fontWeight: 700 }}>
            Contatos
          </Typography>
          <IconButton onClick={logout} aria-label="Sair" color="inherit">
            <SettingsIcon />
          </IconButton>
          <Divider flexItem orientation="vertical" sx={{ mx: 0.5 }} />
          <Typography color="text.secondary" sx={{ mr: 1 }}>
            {user?.name}
          </Typography>
          <IconButton onClick={logout} aria-label="Sair" color="inherit">
            <LogoutIcon />
          </IconButton>
        </Toolbar>
      </AppBar>

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
            {/* Filtros e ações */}
            <Stack direction="row" spacing={1} sx={{ mb: 1 }}>
              <TextField
                value={q}
                onChange={(e) => {
                  setPage(1);
                  setQ(e.target.value);
                }}
                placeholder="Buscar por nome ou CPF"
                size="small"
                sx={{ flex: 1, minWidth: 0 }}
                slotProps={{
                  input: {
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon />
                      </InputAdornment>
                    ),
                  },
                }}
              />

              <Button
                variant="contained"
                startIcon={<AddIcon />}
                sx={{ borderRadius: 2 }}
                onClick={() => setOpenNew(true)}
              >
                Novo
              </Button>

              <ContactDialog
                open={!!editing}
                contact={editing}
                onClose={() => setEditing(null)}
                onSaved={(updated) => {
                  setRows((prev) =>
                    prev.map((r) => (r.id === updated.id ? updated : r))
                  );
                  setEditing(null);
                }}
              />
              <ContactDialog
                open={openNew}
                contact={null}
                onClose={() => setOpenNew(false)}
                onSaved={(newContact) => {
                  setRows((prev) => [newContact, ...prev]);
                  setOpenNew(false);
                }}
              />
            </Stack>

            {loading && <LinearProgress sx={{ mb: 1 }} />}
            <Paper sx={{ p: 1, mb: 1 }}>
              {/* Filtros de ordenação e paginação */}
              <Stack
                direction="row"
                spacing={1}
                alignItems="center"
                sx={{ mb: 1.5 }}
              >
                <Select
                  size="small"
                  value={sort}
                  onChange={(e) => setSort(e.target.value)}
                >
                  <MenuItem value="name">Nome</MenuItem>
                  <MenuItem value="cpf">CPF</MenuItem>
                  <MenuItem value="created_at">Criados</MenuItem>
                </Select>
                <ToggleButtonGroup
                  size="small"
                  color="primary"
                  exclusive
                  value={dir}
                  onChange={(_, v) => v && setDir(v)}
                >
                  <ToggleButton value="asc">ASC</ToggleButton>
                  <ToggleButton value="desc">DESC</ToggleButton>
                </ToggleButtonGroup>
                <Select
                  size="small"
                  value={perPage}
                  onChange={(e) => {
                    setPerPage(Number(e.target.value));
                    setPage(1);
                  }}
                >
                  {[5, 10, 20, 50].map((n) => (
                    <MenuItem key={n} value={n}>
                      {n}/pág
                    </MenuItem>
                  ))}
                </Select>
                <Button
                  size="small"
                  startIcon={<RefreshIcon />}
                  onClick={fetchData}
                >
                  Atualizar
                </Button>
                <Button size="small" onClick={reset}>
                  Limpar
                </Button>
              </Stack>
              {/* Lista de contatos */}
              <Box
                ref={listRef}
                padding="12"
                sx={{ overflow: "auto", pr: 0.5 }}
              >
                {rows.length === 0 && !loading && (
                  <Paper
                    sx={{ p: 2, textAlign: "center", color: "text.secondary" }}
                  >
                    Nenhum contato encontrado.
                  </Paper>
                )}

                <Stack spacing={1}>
                  {rows.map((c) => (
                    <Box key={c.id} data-id={c.id}>
                      <ContactCard
                        name={c.name}
                        subtitle={[
                          c.street,
                          c.number,
                          c.neighborhood,
                          c.city,
                          c.state,
                        ]
                          .filter(Boolean)
                          .join(", ")}
                        selected={selectedId === c.id}
                        onClick={() => setSelectedId(c.id)}
                        contact={c}
                        onCopy={copyContact}
                        onEdit={handleEdit}
                        onDelete={handleDelete}
                      />
                    </Box>
                  ))}
                </Stack>

                <Stack direction="row" justifyContent="center" sx={{ py: 1.5 }}>
                  <Pagination
                    page={page}
                    count={totalPages}
                    onChange={(_, p) => setPage(p)}
                    color="primary"
                  />
                </Stack>
              </Box>
            </Paper>

            {loading && <LinearProgress sx={{ mb: 1 }} />}
          </Box>

          {/* Mapa dos contatos */}
          <Box sx={{ height: "100%" }}>
            <Paper sx={{ p: 1, height: "100%", borderRadius: 2 }}>
              <Box sx={{ height: "100%", borderRadius: 2, overflow: "hidden" }}>
                <ContactsMap
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
