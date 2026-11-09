<?php

use App\Libraries\TokenHash;
use App\Support\Uuid;
use CodeIgniter\Test\CIUnitTestCase;

/**
 * @internal
 */
final class TokenHashTest extends CIUnitTestCase
{
    public function testSecretHashIsStableAndNotTheSecretItself(): void
    {
        $secret = 'jeton-secret';

        $hash = TokenHash::forSecret($secret);

        $this->assertSame($hash, TokenHash::forSecret($secret));
        $this->assertNotSame($secret, $hash);
        $this->assertSame(64, strlen($hash));
    }

    public function testResetCodeHashDependsOnTheEmail(): void
    {
        $sameCode = '123456';

        $this->assertNotSame(
            TokenHash::forResetCode('a@ikwook.cd', $sameCode),
            TokenHash::forResetCode('b@ikwook.cd', $sameCode),
        );
    }

    public function testResetCodeHashIgnoresEmailCaseAndSpaces(): void
    {
        $this->assertSame(
            TokenHash::forResetCode('  Admin@Ikwook.cd ', '123456'),
            TokenHash::forResetCode('admin@ikwook.cd', '123456'),
        );
    }

    public function testUuidLooksLikeVersion4(): void
    {
        $id = Uuid::v4();

        $this->assertMatchesRegularExpression(
            '/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/',
            $id,
        );
    }
}
