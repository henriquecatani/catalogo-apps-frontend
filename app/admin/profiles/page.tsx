"use client";
import { useEffect, useState } from "react";
import { getToken } from "@/app/login/auth_service";

type Profile = {
    id: number;
    fullName: string;
    avatarUrl?: string | null;
    birthDate?: string | null;
    userId: number;
};

type User = {
    id: number;
    name: string;
    email: string;
};

export default function Profiles() {
    const API = "http://localhost:3000/api/profiles";
    const USERS_API = "http://localhost:3000/api/users"; 
    
    const [fullName, setFullName] = useState("");
    const [avatarUrl, setAvatarUrl] = useState("");
    const [birthDate, setBirthDate] = useState("");
    const [userId, setUserId] = useState<number | string>("");

    const [profiles, setProfiles] = useState<Profile[]>([]);
    const [users, setUsers] = useState<User[]>([]);
    const [error, setError] = useState("");
    const [id, setId] = useState<number | null>(null);

    async function loadProfiles() {
        try {
            const response = await fetch(API, {
                headers: { Authorization: `Bearer ${getToken()}` },
            });
            if (!response.ok) throw new Error("Não foi possível carregar os perfis.");
            setProfiles(await response.json());
        } catch {
            setError("Não foi possível carregar os perfis. Verifique a API.");
        }
    }

    async function loadUsers() {
        try {
            const response = await fetch(USERS_API, {
                headers: { Authorization: `Bearer ${getToken()}` },
            });
            if (response.ok) setUsers(await response.json());
        } catch {
            console.error("Não foi possível carregar a lista de usuários.");
        }
    }

    async function save(event: React.FormEvent) {
        event.preventDefault();
        setError("");
        
        try {
            const formattedBirthDate = birthDate ? new Date(birthDate).toISOString() : null;
            
            const payload = {
                userId: Number(userId),
                fullName: fullName,
                birthDate: formattedBirthDate,
                avatarUrl: avatarUrl || null
            };

            const response = await fetch(id === null ? API : `${API}/${id}`, {
                method: id === null ? "POST" : "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${getToken()}`,
                },
                body: JSON.stringify(payload),
            });
            
            if (!response.ok) throw new Error();
            
            setFullName("");
            setAvatarUrl("");
            setBirthDate("");
            setUserId("");
            setId(null);
            
            await loadProfiles();
        } catch {
            setError("Não foi possível salvar o perfil.");
        }
    }

    function edit(profile: Profile) {
        setId(profile.id);
        setFullName(profile.fullName);
        setAvatarUrl(profile.avatarUrl || "");
        setBirthDate(profile.birthDate ? profile.birthDate.toString().split("T")[0] : ""); // "YYYY-MM-DD" 
        setUserId(profile.userId);
    }

    async function remove(profileId: number) {
        try {
            const response = await fetch(`${API}/${profileId}`, {
                method: "DELETE",
                headers: { Authorization: `Bearer ${getToken()}` },
            });
            if (!response.ok) throw new Error();
            await loadProfiles();
        } catch {
            setError("Não foi possível excluir o perfil.");
        }
    }

    useEffect(() => {
        void loadProfiles();
        void loadUsers();
    }, []);

    // Função auxiliar para exibir o nome do usuário na tabela de listagem, vinculando pelo ID.
    const getUserName = (uId: number) => {
        const user = users.find(u => u.id === uId);
        return user ? user.name : `ID: ${uId}`;
    };

    return (
        <main className="container py-4">
            <h1 className="h3 mb-4">Perfis de Usuários</h1>
            
            {error && (
                <div className="alert alert-danger" role="alert">
                    {error}
                </div>
            )}
            
            <form onSubmit={save} className="row g-3 mb-4">
                <div className="col-md-4">
                    <label className="form-label" htmlFor="userId">Usuário Vinculado</label>
                    <select
                        id="userId"
                        className="form-select"
                        value={userId}
                        onChange={(e) => setUserId(e.target.value)}
                        required
                    >
                        <option value="" disabled>Selecione um usuário...</option>
                        {users.map((user) => (
                            <option key={user.id} value={user.id}>{user.name}</option>
                        ))}
                    </select>
                </div>
                <div className="col-md-4">
                    <label className="form-label" htmlFor="fullName">Nome Completo</label>
                    <input
                        id="fullName"
                        className="form-control"
                        type="text"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        required
                    />
                </div>
                <div className="col-md-4">
                    <label className="form-label" htmlFor="birthDate">Data de Nascimento</label>
                    <input
                        id="birthDate"
                        className="form-control"
                        type="date"
                        value={birthDate}
                        onChange={(e) => setBirthDate(e.target.value)}
                    />
                </div>
                <div className="col-md-10">
                    <label className="form-label" htmlFor="avatarUrl">URL do Avatar</label>
                    <input
                        id="avatarUrl"
                        className="form-control"
                        type="url"
                        value={avatarUrl}
                        onChange={(e) => setAvatarUrl(e.target.value)}
                    />
                </div>
                <div className="col-md-2 d-flex align-items-end">
                    <button className="btn btn-primary w-100" type="submit">
                        {id === null ? "Cadastrar" : "Salvar"}
                    </button>
                </div>
            </form>

            <div className="table-responsive">
                <table className="table table-striped align-middle">
                    <thead>
                        <tr>
                            <th>Avatar</th>
                            <th>Nome Completo</th>
                            <th>Usuário Vinculado</th>
                            <th>Nascimento</th>
                            <th className="text-end">Ações</th>
                        </tr>
                    </thead>
                    <tbody>
                        {profiles.map((profile) => (
                            <tr key={profile.id}>
                                <td>
                                    {profile.avatarUrl ? (
                                        <img 
                                            src={profile.avatarUrl} 
                                            alt="Avatar" 
                                            width="40" 
                                            height="40" 
                                            className="rounded-circle" 
                                            style={{ objectFit: "cover" }} 
                                        />
                                    ) : (
                                        <span className="text-secondary small">Sem foto</span>
                                    )}
                                </td>
                                <td>{profile.fullName}</td>
                                <td>{getUserName(profile.userId)}</td>
                                <td>{profile.birthDate ? new Date(profile.birthDate).toLocaleDateString('pt-BR') : "-"}</td>
                                <td className="text-end">
                                    <button
                                        className="btn btn-sm btn-outline-primary me-2"
                                        onClick={() => edit(profile)}
                                    >
                                        Editar
                                    </button>
                                    <button
                                        className="btn btn-sm btn-outline-danger"
                                        onClick={() => void remove(profile.id)}
                                    >
                                        Excluir
                                    </button>
                                </td>
                            </tr>
                        ))}
                        {!profiles.length && (
                            <tr>
                                <td colSpan={5} className="text-center text-secondary py-4">
                                    Nenhum perfil cadastrado.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </main>
    );
}