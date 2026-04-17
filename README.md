# scrumpoint

輕量估點網頁：進房輸入名字就能估點，房間狀態透過 Firebase Realtime Database 即時同步，前端純靜態可直接部署到 GitHub Pages。

## 本機開發

```bash
yarn install
cp .env.example .env          # 填入你的 Firebase config
yarn dev
```

## Firebase 設定

1. 到 https://console.firebase.google.com 建立新專案。
2. Build → **Realtime Database** → 建立資料庫（位置選近的，例如 `asia-southeast1`）。
3. 專案設定 → **Your apps** → 新增 web app，複製 config 值。
4. 填進 `.env`：

   | 變數 | 對應 config 欄位 |
   |---|---|
   | `VITE_FIREBASE_API_KEY` | `apiKey` |
   | `VITE_FIREBASE_AUTH_DOMAIN` | `authDomain` |
   | `VITE_FIREBASE_DATABASE_URL` | `databaseURL` |
   | `VITE_FIREBASE_PROJECT_ID` | `projectId` |
   | `VITE_FIREBASE_APP_ID` | `appId` |

### Security rules

RTDB 預設 test mode 30 天後就關了，建議改成這份 rule：只允許讀寫 `rooms/*`，限制欄位和大小以避免被當免費 DB。

```json
{
  "rules": {
    "rooms": {
      "$roomId": {
        ".read": true,
        ".write": true,
        ".validate": "$roomId.length <= 40",
        "revealed": { ".validate": "newData.isBoolean()" },
        "players": {
          "$playerId": {
            ".validate": "newData.hasChildren(['name', 'joinedAt'])",
            "name":     { ".validate": "newData.isString() && newData.val().length <= 30" },
            "vote":     { ".validate": "newData.isString() || newData.val() == null" },
            "joinedAt": { ".validate": "newData.isNumber()" },
            "$other":   { ".validate": false }
          }
        },
        "$other": { ".validate": false }
      }
    }
  }
}
```

房間只有在真的有人的時候才存在（離開時 `onDisconnect` 自動清掉自己）。沒人的房間會變空物件，RTDB 會自動清除。

## 部署到 GitHub Pages

1. 把專案推到 GitHub。
2. Repo 設定 → **Pages** → Source 選 **GitHub Actions**。
3. Repo 設定 → **Secrets and variables → Actions** → 新增以下 secrets（和 `.env` 同名）：
   - `VITE_FIREBASE_API_KEY`
   - `VITE_FIREBASE_AUTH_DOMAIN`
   - `VITE_FIREBASE_DATABASE_URL`
   - `VITE_FIREBASE_PROJECT_ID`
   - `VITE_FIREBASE_APP_ID`
4. Push 到 `main` 會自動 build & deploy（workflow 在 `.github/workflows/deploy.yml`）。

> Firebase 的 `apiKey` 本來就是公開的 client 識別碼，不是機密。真正把關的是 Realtime Database security rules。

## 路由

使用 hash routing 相容 GitHub Pages 的靜態 hosting：

- `#/` — 大廳（輸入名字與房號）
- `#/room/{roomId}` — 估點房

## 技術

- Vite + React + TypeScript
- Firebase Realtime Database（即時同步）
- `localStorage` 記住上次名字與房號
- `sessionStorage` 保留 playerId，讓重新整理後仍是同一個人
- `onDisconnect` 處理離線自動退房
