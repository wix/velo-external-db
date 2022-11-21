import { Uninitialized } from '@wix-velo/test-commons'
import * as driver from '../../test/drivers/auth_middleware_test_support'
import { errors } from '@wix-velo/velo-external-db-commons'
const { UnauthorizedError } = errors
import * as Chance from 'chance'
import { JwtAuthenticator, TOKEN_ISSUER } from './jwt-auth-middleware'
import { WixDataFacadeMock } from '../../test/drivers/auth_middleware_test_support'
import * as jwt from 'jsonwebtoken'
import { decodeBase64 } from '../utils/base64_utils'

const chance = Chance()

describe('JWT Auth Middleware', () => {

    const ctx = {
        externalDatabaseId: Uninitialized,
        metasite: Uninitialized,
        allowedMetasites: Uninitialized,
        next: Uninitialized,
        ownerRole: Uninitialized,
        dataPath: Uninitialized,
        authPublicKey: 'LS0tLS1CRUdJTiBQVUJMSUMgS0VZLS0tLS0KTUlJQ0lqQU5CZ2txaGtpRzl3MEJBUUVGQUFPQ0FnOEFNSUlDQ2dLQ0FnRUFwUmlyaWk5S1VWcDVpSnRMUTZZNQpRanBDYVdGWGUyOUpxdk1TZStRejNJYjdDM1U1WE1VNlpUdk1XdkxsTUlUTElURGdtT0c2UVpjblVMK3BRYnVvCkwwU3dHbExlRHoyVnN2Znd0RmlTMFBrdVZMeFVpRDIzZVVQS3NMcHNVaW9hS0NxMi9Ocm1NTnBRVUIxaHVMcWMKczk3UlFDSm5DR0g1VHlXSVpEbjdnUkRPZklFcXQzQnZadUFZTkg5WUtSdTFIR1VPTVM0bTkxK2Qramd6RkxJWgpnSGtoNmt2SjlzbFRhWElTaWhaK3lVUElDWEZnN1Jkb2lpOVVXN1E3VFA0R2d6RG0xSkFpQ1M3OCtpZCt6cThQCnNYUVlOWEExNGh1M2dyZm5ZcXk2S1hrZjd5Z0N1UXFmbi8rKy92RjVpcHZkNGdJeFN0QUZCR2pCS2VFVFVVSGgKM2tmVDhqWTNhVHNqTXQzcDZ0RGMyRHRQdDAyVjZpSTU2RDVxVmJNTlp3SCtHUFRkTWZzdkVjN2tHVTFRUlFXUwo1Z1ZZK3FaMzBxbkFxbVlIS2RZSGxpcVNtRzhlclc0aXcyMFZlaEdqeGZQQTYrNXFxNUVnRGJ3VGtPZGZ5aTN0CnVSSEN5WDZ1NHQvWkVGdVVDdmN2UW1hZ0laWUNYT3phNDJBWEErUzBnaWQ5Q2Y4bXNWNnYwNHMvVDhFKy9qUU0KcXVNeEs5bU53QTl6cmdabE5zM08rdHFWaUp1bitFSzRHZ0ovaDlkdit1N1N5TmR5WUZkeEdkT1Nrb3pSclBYcwo2WmNMUFNuZU1vZE5VcEVEdFMvM3h4MW5naDhLelJXY3pQTlZnbENhYTZpN2ZmWG9DaTg4ZTNxVXpnVksvZ3E4CnU0VTJ0Sm1pNWdBQk9EblhuQ1BvRWdVQ0F3RUFBUT09Ci0tLS0tRU5EIFBVQkxJQyBLRVktLS0tLQ==',
        authPrivateKey: 'LS0tLS1CRUdJTiBSU0EgUFJJVkFURSBLRVktLS0tLQpNSUlKSndJQkFBS0NBZ0VBcFJpcmlpOUtVVnA1aUp0TFE2WTVRanBDYVdGWGUyOUpxdk1TZStRejNJYjdDM1U1ClhNVTZaVHZNV3ZMbE1JVExJVERnbU9HNlFaY25VTCtwUWJ1b0wwU3dHbExlRHoyVnN2Znd0RmlTMFBrdVZMeFUKaUQyM2VVUEtzTHBzVWlvYUtDcTIvTnJtTU5wUVVCMWh1THFjczk3UlFDSm5DR0g1VHlXSVpEbjdnUkRPZklFcQp0M0J2WnVBWU5IOVlLUnUxSEdVT01TNG05MStkK2pnekZMSVpnSGtoNmt2SjlzbFRhWElTaWhaK3lVUElDWEZnCjdSZG9paTlVVzdRN1RQNEdnekRtMUpBaUNTNzgraWQrenE4UHNYUVlOWEExNGh1M2dyZm5ZcXk2S1hrZjd5Z0MKdVFxZm4vKysvdkY1aXB2ZDRnSXhTdEFGQkdqQktlRVRVVUhoM2tmVDhqWTNhVHNqTXQzcDZ0RGMyRHRQdDAyVgo2aUk1NkQ1cVZiTU5ad0grR1BUZE1mc3ZFYzdrR1UxUVJRV1M1Z1ZZK3FaMzBxbkFxbVlIS2RZSGxpcVNtRzhlCnJXNGl3MjBWZWhHanhmUEE2KzVxcTVFZ0Rid1RrT2RmeWkzdHVSSEN5WDZ1NHQvWkVGdVVDdmN2UW1hZ0laWUMKWE96YTQyQVhBK1MwZ2lkOUNmOG1zVjZ2MDRzL1Q4RSsvalFNcXVNeEs5bU53QTl6cmdabE5zM08rdHFWaUp1bgorRUs0R2dKL2g5ZHYrdTdTeU5keVlGZHhHZE9Ta296UnJQWHM2WmNMUFNuZU1vZE5VcEVEdFMvM3h4MW5naDhLCnpSV2N6UE5WZ2xDYWE2aTdmZlhvQ2k4OGUzcVV6Z1ZLL2dxOHU0VTJ0Sm1pNWdBQk9EblhuQ1BvRWdVQ0F3RUEKQVFLQ0FnQWJJRUtQSWRZRUorbHdHSlAxT1lxTzV5T2lUT3dpeTlZKzBGRnBLY1dicGxINVAvbDgxS3NUbHcrcwpvZHdtYktzemVPUnVPaWh3UG5XblB0YUFobVRMMzIxUDVlMjJjMWYxWCtlY3VqRGxSUXZud0VualdNQ2NuQmJoCmtyL1pnREZzQ0JpbzB3NmZXRDk1NmxuMEVEVlBHSDBwSEgzeFVxZXo2V2JQa1BkUjdZRC8wL2xBeXFpRExxN0wKY1dENjRDS1IxOGpOSzlnYkxRcTM0aVFDY29EZUt3ajNoaHhaQUJ0RWFBbkR4bzV1WTBTcXlJWTBiblF1d0RnTQpHVURsRlpmY1ZseVc4RmVuU3FFbU9QY00zcGFsZ1gyNHlnY1FiNTFuVFBBbnRsbWdGdGE0Wk1xTnZNRWRlTmZZCjY3UWNvaCtDMHZsbVlXZHhvZ1NhN1BCUG1aT1N2bjZDanBEazBqdEZ0RmNMazMwQzFGRkY2WHN0TXRGUndITXYKWHNuVmpPU1c5UlVUQUx1ZW1DaGU3NGJtbE4zbUJDaS9YN1h4WGpBWkpON2w3cFB0SmNvN0VXalRPZHh1aHgxbAp5NGdJQUU1YTQxS1RwSnc0TmlNVlFLaWVUSHRqZmVBMUJoazNMN0tiSkxONnl5REtONWV1eWx4ekdFdHlheGN6CnlGMVl5djAwcjljWXRLV3BXZEg0S2ZUWUlCdzk4aGRVVXZIN2llSHZQNjNqdFZqTmx2eHJLWkFPamQ5bWdtREYKc0RnWjJEclM5TjludjRUbHIrMTRqWGhYOGpHMmJHYmxDVzVKejAyazdqelR3OUhXRTFsWkFhYkJ0WmJxZFhrOQpnaG05Ti9NWEdFYUpCUDJSWks1Ykp1d3FQdW84SjR6dUhtN2RteFdxeUloVVlWUzZ3UUtDQVFFQTFjeG5BS0V0CkIvMnZnQ0REODJqOGxMSlNGRUlEQ2l6MzA4Szg0QjJnVnV4anBrVVdMQ2dXOEJyUzZmQ1dRNHpVeVkydFlQUlUKVS9lcWFuU1UzdDFWME1iUU5JUjhJSjBEdWxwU2VtYzUrcEREdlJMNnN4V3E4eXcyWVBKQjRMelpKV0NTY0NoRQp1dW9KOFcvTWJaa2tDVHZDTmFjUWcvWmVkQ1cyQ0c4SDVXREJ6SmJORm4yOXBVZnVhalNhVXBNcmhPTENMZFQrClBYOVN5RTBZZDlWR1YrTDgrZGc1YUl2UWpIenkwZXppZnBwSEFrUzFiQ0t5M2pBYTZxVnpOaXJaYzFqUEZJYTEKMk5ZbzI4a2tjazlyVHJMWHAraFF4Qlk2RVA1YUVDOE1KaTZvODF6YkorekZvOXZmb1hPS1RLYUdSVy8xT1BRRQpvaGtKai90TWpSaFJvd0tDQVFFQXhhOUU2RWxSQy9icTF6VE5tcTVKalFnS2I3SjF5VmlIQWU1YVpNbEEvaUg1CktvMUQvZGo0SGlVbzZTR0kwZVMzQ0hpc2pDT2NTWlB6c1RUQUFsZWVkS0RITVFBR29yeTBsU2htSkdsWkx3MUcKbFhIRm5pT1JJc2xwcHMreVp6VVBRRnh3dWIzV25DUm0yK2pxZ1ZLcHhHNTl3anFsVHE0LzZwS2RYeGp4NGJycApLOUM4RCsveUo0RUliU3lUVDY3TVB2MDg2OXRvaHhRWGZ0UHk1UlZuVEJCekpTaVFIU3RzQ0txRlp2R01jc1crCnM2WHpOOWY2YndoK21jaHZnMjFwa3piRkx5RUR4cUlMd1Z2OTVYY050SGtJS01mZnI2Z0w3czRsc3greFFMeG4KTUQ4VFhlSUIzTkNFNWNLQXl1blI3UVE4UVM3SXlSa2MxQUpzUk0vWU53S0NBUUFJRFI2RDQ0M3lreGNjMkI4SQo5NWNyY2x1czc1OTFycVBXa2FyVE5jcG4rNWIxRi96eHhNQzRZZ28zVFJ3Ymh4NHNTTzJTalNEdjJJL09XbjJRCnR2MFlVNlJibGZHbXVNTC9MWStWbEhXV2ZnVWhCYW56UEltbmhxNjFqK256TUtsc3d1cEExd05mbHBpeFF1aUwKNkF4M1hJeS93SDdhdVZodFAwNVBtdjdOSUl1cnpMSUVlcys5ZmF2NHkrcFQyYjcxemlSSjNZK0ZlVm9BdVFhRwozTDA5YWdya3pjTzdzQ2cyWWk0eXdaejE3NUZsQUhsa2pSbjNUQkIzYmF1ZENwZ053L1pvYTNwRnBDcjl1K0ZuCmZKNHA1SXBDaEhrbUtVQWVpN1dRam5VQ3F4Y3Bzd0Y5eTJqVjl0M0JFcnpPamliWVRwTUpoZ2IybzhLOGJWWkEKcWYzSkFvSUJBSG9PMHh3ZGtNWXphaU1Bdm1aZ2NKZDh2SHpsRXFjRVd5L05ETkVvRmxJVGhmWkpEUThpdFdoZgpoMWdTMVpqTGdGdmhycUJFcUk0aHBSam9PaG40SWFWZlZENGtCdlRhVVNHN3RQMk1jbjJEMCs0WU5tMkRCbTBWCk1YL0d4Qi9IZWloQ0szUDBEQnVTdWxQVUIxOWNPK2hHVkszbGFnWWZ2dVZHSzViNUh2aENZUkFsck1pbVhiMFkKaGF4ckZuWGZ0c3E1cjdEdFl5ZnNOdW1mVWwweUR2cS9PV2xiRjBoN2RCUVJ2WmFuVkJIVm1QN3hXekJDMGFWVworRnhaanNqMmVIWm1IZkFRa1hWR3ZyMWY0RytiUjhJRDdRN0pBb3RCMWtSWDBwMDcxMFRpVDFCUjBkSm81citCCm5GMEU4R0xaWmozVEhLVWVqdWpqOFpIU0FTbW5yNWNDZ2dFQUljZStBYVBrNmpGNGErdWRZai9kWnFmWUdPV3MKT212Si9ROFkzUlJhcXZXaHkzM0NMaEVkVStzRE1sbmxxZ0lkNTl3aCsvY0wzM2tXTC9hbnVYdkFPOXJXY2p4RgpqWGZ3dHJ2UzBDVS9YZStEUHBHd1FJSWxoT2VtNWc0QkxDQnVsemJVeFh6d2JPRy8yTDNSb0NqUzNES21oSklyCnRrNlBVWVhpbWxYTXdudGNjb0dJNHhrTThtR0lmY3ZSZVJrYkdpemVqMjJ5dVQvS05taXBEc2VNeHpFdFRObmEKYmZxMUYrM2E4STBlM0ZpSjVYVWswcFpMVTEzcy9OVllaV21rVGR2VDZKWVpNem1oZ2FRQTMxV1c3UFhVM0FxeQo5SGRsSlcyVGt0Wk0rcGZ3UHN6emhCVzJlYVd1clc2SDZVR1UyZWx5TlpXbTF3YkMvVjhvdDFTMlVRPT0KLS0tLS1FTkQgUlNBIFBSSVZBVEUgS0VZLS0tLS0=',
        otherAuthPublicKey: 'LS0tLS1CRUdJTiBQVUJMSUMgS0VZLS0tLS0KTklJQ0lqQU5CZ2txaGtpRzl3MEJBUUVGQUFPQ0FnOEFNSUlDQ2dLQ0FnRUFwUmlyaWk5S1VWcDVpSnRMUTZZNQpSanBDYVdGWGUyOUpxdk1TZStRejNJYjdDM1U1WE1VNlpUdk1XdkxsTUlUTElURGdtT0c2UVpjblVMK3BRYnVvCkcwU3dHbExlRHoyVnN2Znd0RmlTMFBrdVZMeFVpRDIzZVVQS3NMcHNVaW9hS0NxMi9Ocm1NTnBRVUIxaHVMcWMKeDk3UlFDSm5DR0g1VHlXSVpEbjdnUkRPZklFcXQzQnZadUFZTkg5WUtSdTFIR1VPTVM0bTkxK2Qramd6RkxJWgpoSGtoNmt2SjlzbFRhWElTaWhaK3lVUElDWEZnN1Jkb2lpOVVXN1E3VFA0R2d6RG0xSkFpQ1M3OCtpZCt6cThQCnNYUVlOWEExNGh1M2dyZm5ZcXk2S1hrZjd5Z0N1UXFmbi8rKy92RjVpcHZkNGdJeFN0QUZCR2pCS2VFVFVVSGgKM2tmVDhqWTNhVHNqTXQzcDZ0RGMyRHRQdDAyVjZpSTU2RDVxVmJNTlp3SCtHUFRkTWZzdkVjN2tHVTFRUlFXUwo1Z1ZZK3FaMzBxbkFxbVlIS2RZSGxpcVNtRzhlclc0aXcyMFZlaEdqeGZQQTYrNXFxNUVnRGJ3VGtPZGZ5aTN0CnVSSEN5WDZ1NHQvWkVGdVVDdmN2UW1hZ0laWUNYT3phNDJBWEErUzBnaWQ5Q2Y4bXNWNnYwNHMvVDhFKy9qUU0KcXVNeEs5bU53QTl6cmdabE5zM08rdHFWaUp1bitFSzRHZ0ovaDlkdit1N1N5TmR5WUZkeEdkT1Nrb3pSclBYcwo2WmNMUFNuZU1vZE5VcEVEdFMvM3h4MW5naDhLelJXY3pQTlZnbENiYjVqN2ZmWG9DaTg4ZTNxVXpnVksvZ3E4CnU0VTJ0Sm1pNWdBQk9EblhuQ1BvRWdVQ0F3RUFBUT09Ci0tLS0tRU5EIFBVQkxJQyBLRVktLS0tLQ==',
    }

    const env = {
        auth: Uninitialized,
    }

    beforeEach(() => {
        ctx.externalDatabaseId = chance.word()
        ctx.metasite = chance.word()
        ctx.allowedMetasites = ctx.metasite
        ctx.next = jest.fn().mockName('next')
        env.auth = new JwtAuthenticator(ctx.externalDatabaseId, ctx.allowedMetasites, new WixDataFacadeMock(decodeBase64(ctx.authPublicKey))).authorizeJwt()
    })

    test('should authorize when JWT valid', async() => {
        const token = jwt.sign({ iss: TOKEN_ISSUER, metasite: ctx.metasite }, decodeBase64(ctx.authPrivateKey), { algorithm: 'RS256' })
        await env.auth(driver.requestBodyWith(ctx.ownerRole, ctx.dataPath, `Bearer ${token}`), Uninitialized, ctx.next)

        expect(ctx.next).toHaveBeenCalledWith()
    })

    test('should authorize when JWT valid, only with second public key', async() => {
        const token = jwt.sign({ iss: TOKEN_ISSUER, metasite: ctx.metasite }, decodeBase64(ctx.authPrivateKey), { algorithm: 'RS256' })
        env.auth = new JwtAuthenticator(ctx.externalDatabaseId, ctx.allowedMetasites, new WixDataFacadeMock(decodeBase64(ctx.otherAuthPublicKey), decodeBase64(ctx.authPublicKey))).authorizeJwt()
        await env.auth(driver.requestBodyWith(ctx.ownerRole, ctx.dataPath, `Bearer ${token}`), Uninitialized, ctx.next)

        expect(ctx.next).toHaveBeenCalledWith()
    })

    test('should throw when JWT metasite is not allowed', async() => {
        const token = jwt.sign({ iss: TOKEN_ISSUER, metasite: chance.word() }, decodeBase64(ctx.authPrivateKey), { algorithm: 'RS256' })
        await env.auth(driver.requestBodyWith(ctx.ownerRole, ctx.dataPath, `Bearer ${token}`), Uninitialized, ctx.next)

        expect(ctx.next).toHaveBeenCalledWith(new UnauthorizedError('You are not authorized'))
    })

    test('should throw when JWT has no metasite claim', async() => {
        const token = jwt.sign({ iss: TOKEN_ISSUER }, decodeBase64(ctx.authPrivateKey), { algorithm: 'RS256' })
        await env.auth(driver.requestBodyWith(ctx.ownerRole, ctx.dataPath, `Bearer ${token}`), Uninitialized, ctx.next)

        expect(ctx.next).toHaveBeenCalledWith(new UnauthorizedError('You are not authorized'))
    })

    test('should throw when JWT issuer is not Wix-Data', async() => {
        const token = jwt.sign({ iss: chance.word(), metasite: ctx.metasite }, decodeBase64(ctx.authPrivateKey), { algorithm: 'RS256' })
        await env.auth(driver.requestBodyWith(ctx.ownerRole, ctx.dataPath, `Bearer ${token}`), Uninitialized, ctx.next)

        expect(ctx.next).toHaveBeenCalledWith(new UnauthorizedError('You are not authorized'))
    })

    test('should throw when JWT has no issuer', async() => {
        const token = jwt.sign({ metasite: ctx.metasite }, decodeBase64(ctx.authPrivateKey), { algorithm: 'RS256' })
        await env.auth(driver.requestBodyWith(ctx.ownerRole, ctx.dataPath, `Bearer ${token}`), Uninitialized, ctx.next)

        expect(ctx.next).toHaveBeenCalledWith(new UnauthorizedError('You are not authorized'))
    })

    test('should throw when JWT is expired', async() => {
        const token = jwt.sign({ iss: TOKEN_ISSUER, metasite: ctx.metasite }, decodeBase64(ctx.authPrivateKey), { algorithm: 'RS256', expiresIn: '10ms' })
        setTimeout(() => {}, 1000)
        await env.auth(driver.requestBodyWith(ctx.ownerRole, ctx.dataPath, `Bearer ${token}`), Uninitialized, ctx.next)

        expect(ctx.next).toHaveBeenCalledWith(new UnauthorizedError('You are not authorized'))
    })
})
