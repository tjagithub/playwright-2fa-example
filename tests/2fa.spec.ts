import { test, expect } from '@playwright/test'
import { totpTest } from '@fixture/2fa.fixture'
import OTPAuth from 'otpauth'
import 'dotenv/config'

test('invalid auth token fails', async ({ page }) => {
  expect(process.env.GITHUB_USER).toBeDefined()
  expect(process.env.GITHUB_PWD).toBeDefined()
  let totp = new OTPAuth.TOTP({
    issuer: "GitHub",
    label: "USERNAME",
    algorithm: "SHA1",
    digits: 6,
    period: 30,
    secret: "FAKESECRETID"
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
  const failedAuthentication = await page.getByText('Two-factor authentication failed.').first()
  await expect(failedAuthentication).toHaveText('Two-factor authentication failed.')
})

test('valid auth token passes', async ({ page }, testinfo) => {
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
  await expect(page).toHaveURL("https://github.com")
  await testinfo.attach("home", { body: await page.screenshot(), contentType: "image/png" })
})

/**
 * This test uses a test fixture, abstracting away the boilerplate 
 */
totpTest('valid auth token passes using fixture', async ({ page }, testinfo) => {
  await expect(page).toHaveURL("https://github.com")
  await testinfo.attach("home", { body: await page.screenshot(), contentType: "image/png" })
})