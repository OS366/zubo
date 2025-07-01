import React, { useEffect, useState } from "react";
import { getLeaderboardEntries } from "../utils/leaderboard";
import { LeaderboardEntry } from "../types";
import { Table, Input, Select } from "antd";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";

const COLORS = [
  "#8884d8",
  "#82ca9d",
  "#ffc658",
  "#ff8042",
  "#a78bfa",
  "#f87171",
  "#34d399",
];

const ADMIN_SESSION_KEY = "zubo_admin_session";

const Admin: React.FC = () => {
  const [data, setData] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [ageFilter, setAgeFilter] = useState<string | undefined>(undefined);
  const [isLoggedIn, setIsLoggedIn] = useState(
    () => !!localStorage.getItem(ADMIN_SESSION_KEY)
  );
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);
  const [loginForm, setLoginForm] = useState({
    username: "",
    password: "",
    acceptance_code: "",
  });

  useEffect(() => {
    if (isLoggedIn) {
      getLeaderboardEntries().then((entries) => {
        setData(entries);
        setLoading(false);
      });
    }
  }, [isLoggedIn]);

  // Filtering
  const filtered = data.filter((entry) => {
    const matchesSearch =
      entry.firstName.toLowerCase().includes(search.toLowerCase()) ||
      entry.lastName.toLowerCase().includes(search.toLowerCase()) ||
      entry.email.toLowerCase().includes(search.toLowerCase());
    const matchesAge = ageFilter ? entry.ageRange === ageFilter : true;
    return matchesSearch && matchesAge;
  });

  // Analytics
  const personaCounts = data.reduce((acc, entry) => {
    if (!entry.persona) return acc;
    acc[entry.persona] = (acc[entry.persona] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  const personaChart = Object.entries(personaCounts).map(([name, value]) => ({
    name,
    value,
  }));

  const ageCounts = data.reduce((acc, entry) => {
    acc[entry.ageRange] = (acc[entry.ageRange] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  const ageChart = Object.entries(ageCounts).map(([name, value]) => ({
    name,
    value,
  }));

  const columns = [
    {
      title: "First Name",
      dataIndex: "firstName",
      key: "firstName",
      sorter: (a, b) => a.firstName.localeCompare(b.firstName),
    },
    {
      title: "Last Name",
      dataIndex: "lastName",
      key: "lastName",
      sorter: (a, b) => a.lastName.localeCompare(b.lastName),
    },
    { title: "Email", dataIndex: "email", key: "email" },
    {
      title: "Score",
      dataIndex: "score",
      key: "score",
      sorter: (a, b) => a.score - b.score,
    },
    {
      title: "Lives",
      dataIndex: "livesRemaining",
      key: "livesRemaining",
      sorter: (a, b) => a.livesRemaining - b.livesRemaining,
    },
    {
      title: "Questions",
      dataIndex: "questionsAnswered",
      key: "questionsAnswered",
      sorter: (a, b) => a.questionsAnswered - b.questionsAnswered,
    },
    { title: "Persona", dataIndex: "persona", key: "persona" },
    { title: "Age Range", dataIndex: "ageRange", key: "ageRange" },
    {
      title: "Completed At",
      dataIndex: "completedAt",
      key: "completedAt",
      render: (v) => (v ? new Date(v).toLocaleString() : ""),
    },
  ];

  const handleLoginChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLoginForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginLoading(true);
    setLoginError(null);
    try {
      const res = await fetch("/.netlify/functions/admin-login.cjs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(loginForm),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        localStorage.setItem(ADMIN_SESSION_KEY, "1");
        setIsLoggedIn(true);
      } else {
        setLoginError(data.error || "Login failed");
      }
    } catch (err: any) {
      setLoginError(err.message || "Login failed");
    } finally {
      setLoginLoading(false);
    }
  };

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-purple-900 to-violet-900 p-4">
        <form
          onSubmit={handleLogin}
          className="bg-gray-800 rounded-2xl p-8 border border-gray-700 shadow-2xl max-w-md w-full"
        >
          <h2 className="text-3xl font-bold text-white mb-6 text-center">
            Admin Login
          </h2>
          <div className="mb-4">
            <label className="block text-gray-300 mb-2" htmlFor="username">
              Username
            </label>
            <input
              type="text"
              id="username"
              name="username"
              value={loginForm.username}
              onChange={handleLoginChange}
              className="w-full px-4 py-2 rounded-lg bg-gray-700 border border-gray-600 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              autoComplete="username"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-300 mb-2" htmlFor="password">
              Password
            </label>
            <input
              type="password"
              id="password"
              name="password"
              value={loginForm.password}
              onChange={handleLoginChange}
              className="w-full px-4 py-2 rounded-lg bg-gray-700 border border-gray-600 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              autoComplete="current-password"
              required
            />
          </div>
          <div className="mb-6">
            <label
              className="block text-gray-300 mb-2"
              htmlFor="acceptance_code"
            >
              Acceptance Code
            </label>
            <input
              type="text"
              id="acceptance_code"
              name="acceptance_code"
              value={loginForm.acceptance_code}
              onChange={handleLoginChange}
              className="w-full px-4 py-2 rounded-lg bg-gray-700 border border-gray-600 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              pattern="\d{6}"
              maxLength={6}
              required
            />
          </div>
          {loginError && (
            <div className="mb-4 text-red-400 text-center font-semibold">
              {loginError}
            </div>
          )}
          <button
            type="submit"
            className="w-full py-3 rounded-xl font-bold text-white bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 transition-all duration-300 transform hover:scale-105 shadow-2xl"
            disabled={loginLoading}
          >
            {loginLoading ? "Logging in..." : "Login"}
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto py-12 px-4">
      <h1 className="text-4xl font-bold mb-8 text-white">Admin Analytics</h1>
      <div className="flex flex-wrap gap-4 mb-8">
        <Input
          placeholder="Search by name or email"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ width: 240 }}
        />
        <Select
          allowClear
          placeholder="Filter by age range"
          value={ageFilter}
          onChange={setAgeFilter}
          style={{ width: 180 }}
        >
          {[...new Set(data.map((d) => d.ageRange))].map((age) => (
            <Select.Option key={age} value={age}>
              {age}
            </Select.Option>
          ))}
        </Select>
      </div>
      <Table
        columns={columns}
        dataSource={filtered}
        loading={loading}
        rowKey="id"
        pagination={{ pageSize: 20 }}
        scroll={{ x: true }}
      />
      <div className="grid md:grid-cols-2 gap-8 mt-12">
        <div className="bg-gray-800 rounded-2xl p-8 border border-gray-700 shadow-2xl">
          <h2 className="text-2xl font-bold text-white mb-4">Personas</h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={personaChart}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={100}
                label
              >
                {personaChart.map((entry, idx) => (
                  <Cell
                    key={`cell-${idx}`}
                    fill={COLORS[idx % COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="bg-gray-800 rounded-2xl p-8 border border-gray-700 shadow-2xl">
          <h2 className="text-2xl font-bold text-white mb-4">Age Ranges</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart
              data={ageChart}
              margin={{ top: 20, right: 30, left: 0, bottom: 0 }}
            >
              <XAxis dataKey="name" />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Bar dataKey="value" fill="#a78bfa" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default Admin;
