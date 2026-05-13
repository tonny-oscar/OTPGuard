<?php
/**
 * OTPGuard PHP SDK v1.0.0
 * Official SDK for the OTPGuard MFA Platform
 */

namespace OTPGuard;

class OTPGuardException extends \RuntimeException
{
    private string $errorCode;
    private int    $httpStatus;

    public function __construct(string $message, string $code = 'API_ERROR', int $status = 0)
    {
        parent::__construct($message);
        $this->errorCode  = $code;
        $this->httpStatus = $status;
    }

    public function getErrorCode(): string { return $this->errorCode; }
    public function getHttpStatus(): int   { return $this->httpStatus; }
}

class Client
{
    private const BASE_URL = 'https://otpguard.onrender.com/api';

    private string $apiKey;
    private string $baseUrl;
    private int    $timeout;
    private int    $retries;

    /**
     * @param string $apiKey   Your OTPGuard API key (otpg_...)
     * @param array  $options  ['base_url' => ..., 'timeout' => 10, 'retries' => 2]
     */
    public function __construct(string $apiKey, array $options = [])
    {
        if (empty($apiKey)) {
            throw new OTPGuardException('API key is required', 'MISSING_API_KEY');
        }
        $this->apiKey  = $apiKey;
        $this->baseUrl = rtrim($options['base_url'] ?? self::BASE_URL, '/');
        $this->timeout = $options['timeout'] ?? 10;
        $this->retries = $options['retries'] ?? 2;
    }

    private function request(string $method, string $path, array $body = [], int $attempt = 0): array
    {
        $url = $this->baseUrl . $path;
        $ch  = curl_init($url);

        $headers = [
            'Content-Type: application/json',
            'Accept: application/json',
            'X-API-Key: ' . $this->apiKey,
        ];

        curl_setopt_array($ch, [
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_TIMEOUT        => $this->timeout,
            CURLOPT_HTTPHEADER     => $headers,
            CURLOPT_CUSTOMREQUEST  => strtoupper($method),
        ]);

        if (!empty($body)) {
            curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($body));
        }

        $response   = curl_exec($ch);
        $httpStatus = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        $curlError  = curl_error($ch);
        curl_close($ch);

        if ($curlError) {
            if ($attempt < $this->retries) {
                usleep(500000 * ($attempt + 1));
                return $this->request($method, $path, $body, $attempt + 1);
            }
            throw new OTPGuardException($curlError, 'NETWORK_ERROR');
        }

        $data = json_decode($response, true) ?? [];

        if ($httpStatus < 200 || $httpStatus >= 300) {
            throw new OTPGuardException(
                $data['error'] ?? 'Request failed',
                $data['code']  ?? 'API_ERROR',
                $httpStatus
            );
        }

        return $data;
    }

    /**
     * Send OTP via SMS or Email
     *
     * @param string      $method  'sms' or 'email'
     * @param string|null $phone   Required for SMS (E.164 format)
     * @param string|null $email   Required for email
     * @return array{message: string, otp_id: int, expires_in: int}
     */
    public function sendOTP(string $method, ?string $phone = null, ?string $email = null): array
    {
        if (!in_array($method, ['sms', 'email'], true)) {
            throw new OTPGuardException("method must be 'sms' or 'email'", 'VALIDATION_ERROR');
        }
        if ($method === 'sms' && empty($phone)) {
            throw new OTPGuardException('phone is required for SMS', 'VALIDATION_ERROR');
        }
        if ($method === 'email' && empty($email)) {
            throw new OTPGuardException('email is required for email OTP', 'VALIDATION_ERROR');
        }
        return $this->request('POST', '/mfa/otp/send', [
            'method' => $method,
            'phone'  => $phone,
            'email'  => $email,
        ]);
    }

    /**
     * Verify OTP code
     *
     * @param string      $method  'sms' or 'email'
     * @param string      $code    The OTP code entered by the user
     * @param string|null $phone   Phone number (for SMS)
     * @param string|null $email   Email address (for email)
     * @return array{verified: bool, message: string}
     */
    public function verifyOTP(string $method, string $code, ?string $phone = null, ?string $email = null): array
    {
        if (empty($code)) {
            throw new OTPGuardException('code is required', 'VALIDATION_ERROR');
        }
        return $this->request('POST', '/mfa/otp/verify', [
            'method' => $method,
            'code'   => $code,
            'phone'  => $phone,
            'email'  => $email,
        ]);
    }
}
