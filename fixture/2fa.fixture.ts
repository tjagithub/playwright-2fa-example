import { test, expect } from '@playwright/test'
import OTPAuth from 'otpauth'

export const totpTest = test.extend({
  page: async ({ page }, use) => {
    expect(process.env.GITHUB_USER).toBeDefined()
    expect(process.env.GITHUB_PWD).toBeDefined()
    expect(process.env.GITHUB_TOTP_SECRET).toBeDefined()
    let totp = new OTPAuth.TOTP({
      issuer: "GitHub",
      label: "USERNAME",
      algorithm: "SHA1",
      digits: 6,
      period: 30,
      secret: process.env.GITHUB_TOTP_SECRET
    })
    await page.goto('https://github.com/')
    await page.getByRole("link", { name: "Sign in" }).click()
    await page.getByLabel("Username or email address").click()
    await page
      .getByLabel("Username or email address")
      .fill(process.env.GITHUB_USER ?? "")
    await page.getByLabel("Password").click()
    await page.getByLabel("Password").fill(process.env.GITHUB_PWD ?? "")
    await page.getByRole("button", { name: "Sign in", exact: true }).click()
    await page.getByRole('link', { name: 'Use your authenticator app' }).click()
    await page.getByPlaceholder("XXXXXX").click()
    await page.getByPlaceholder("XXXXXX").fill(totp.generate())

    use(page)
  }
})