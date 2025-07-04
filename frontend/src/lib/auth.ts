import { OpenAPI } from "@/client"

/**
 * Generates a random code verifier string for PKCE (Proof Key for Code Exchange).
 * Creates a cryptographically secure random string by:
 * 1. Generating random values using the Web Crypto API
 * 2. Converting the values to hexadecimal
 * 3. Joining them into a single string
 *
 * @returns A random string to be used as the code verifier in OAuth PKCE flow
 */
export function generateCodeVerifier() {
  const array = new Uint32Array(28)

  window.crypto.getRandomValues(array)

  return Array.from(array, (dec) => `0${dec.toString(16)}`.slice(-2)).join("")
}

/**
 * Generates a code challenge for PKCE (Proof Key for Code Exchange) from a code verifier.
 * The challenge is created by:
 * 1. Encoding the verifier string to bytes
 * 2. Computing the SHA-256 hash of those bytes
 * 3. Base64-URL encoding the hash
 *
 * @param verifier - The code verifier string to generate a challenge from
 * @returns A base64url-encoded string to be used as the code challenge
 */
export async function generateCodeChallenge(verifier: string) {
  const encoder = new TextEncoder()
  const data = encoder.encode(verifier)
  const digest = await window.crypto.subtle.digest("SHA-256", data)

  const base64 = btoa(String.fromCharCode(...new Uint8Array(digest)))

  return base64
    .replace(/\+/g, "-") // Replace '+' with '-'
    .replace(/\//g, "_") // Replace '/' with '_'
    .replace(/=+$/, "") // Remove trailing '='
}

export class FastAPIAuth {
  async socialLogin(provider: "github") {
    const codeVerifier = generateCodeVerifier()
    sessionStorage.setItem("pkce_code_verifier", codeVerifier)

    const codeChallenge = await generateCodeChallenge(codeVerifier)

    const redirectUrl = `${window.location.origin}/callback`

    const params = new URLSearchParams({
      redirect_uri: redirectUrl,
      response_type: "code",
      code_challenge: codeChallenge,
      code_challenge_method: "S256",
    })

    const url = new URL(`/api/v1/${provider}/authorize`, OpenAPI.BASE)

    url.search = params.toString()

    window.location.href = url.toString()
  }

  async linkWithProvider(provider: string) {
    const codeVerifier = generateCodeVerifier()
    sessionStorage.setItem("pkce_code_verifier", codeVerifier)
    sessionStorage.setItem("link_provider", provider)

    const codeChallenge = await generateCodeChallenge(codeVerifier)

    const redirectUrl = `${window.location.origin}/callback`

    const params = new URLSearchParams({
      redirect_uri: redirectUrl,
      response_type: "link_code",
      code_challenge: codeChallenge,
      code_challenge_method: "S256",
    })

    const url = new URL(`/api/v1/${provider}/authorize`, OpenAPI.BASE)

    url.search = params.toString()

    window.location.href = url.toString()
  }

  async exchangeToken(code: string, codeVerifier: string) {
    const redirectUrl = `${window.location.origin}/callback`

    const url = new URL("/api/v1/token", OpenAPI.BASE)

    const response = await fetch(url.toString(), {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        code,
        redirect_uri: redirectUrl,
        client_id: "fastapicloud",
        grant_type: "authorization_code",
        code_verifier: codeVerifier,
      }),
    })

    if (!response.ok) {
      throw new Error("Failed to exchange token")
    }

    const data = await response.json()

    return data
  }

  async finalizeLink(provider: string, code: string, codeVerifier: string) {
    const url = new URL(`/api/v1/${provider}/finalize-link`, OpenAPI.BASE)

    const response = await fetch(url.toString(), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("access_token")}`,
      },
      body: JSON.stringify({
        link_code: code,
        code_verifier: codeVerifier,
      }),
    })

    if (!response.ok) {
      throw new Error("Failed to finalize link")
    }

    return await response.json()
  }

  async handleOAuthCallback() {
    const codeVerifier = sessionStorage.getItem("pkce_code_verifier")

    if (!codeVerifier) {
      throw new Error("Code verifier not found in session storage")
    }

    sessionStorage.removeItem("pkce_code_verifier")

    const linkProvider = sessionStorage.getItem("link_provider")

    sessionStorage.removeItem("link_provider")

    const searchParams = new URLSearchParams(window.location.search)

    if (searchParams.get("error")) {
      throw new Error(searchParams.get("error_description") ?? "Unknown error")
    }

    if (linkProvider) {
      const code = searchParams.get("link_code")

      if (!code) {
        throw new Error("Link code not found in URL")
      }

      await this.finalizeLink(linkProvider, code, codeVerifier)

      window.location.href = "/settings"
    } else {
      const code = searchParams.get("code")
      if (!code) {
        throw new Error("Code not found in URL")
      }

      const data = await this.exchangeToken(code, codeVerifier)

      localStorage.setItem("access_token", data.access_token)
      window.location.href = "/"
    }
  }
}
