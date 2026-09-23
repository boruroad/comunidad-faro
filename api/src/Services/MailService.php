<?php

// Envio de correos best-effort via mail() nativo; si no hay MTA configurado en el
// entorno local, el enlace se deja en el log de PHP para no bloquear el flujo en desarrollo.
class MailService
{
    public function send($to, $subject, $htmlBody, $textBody = '')
    {
        $fromEmail = env_value('MAIL_FROM_ADDRESS', 'no-responder@faro.loc');
        $fromName = env_value('MAIL_FROM_NAME', env_value('APP_NAME', 'Comunidad FARO'));
        $boundary = md5((string) microtime());

        $headers = array();
        $headers[] = 'From: ' . $this->encodeHeader($fromName) . ' <' . $fromEmail . '>';
        $headers[] = 'Reply-To: ' . $fromEmail;
        $headers[] = 'MIME-Version: 1.0';
        $headers[] = 'Content-Type: multipart/alternative; boundary="' . $boundary . '"';

        $body = '--' . $boundary . "\r\n"
            . "Content-Type: text/plain; charset=UTF-8\r\n\r\n"
            . ($textBody !== '' ? $textBody : strip_tags($htmlBody)) . "\r\n"
            . '--' . $boundary . "\r\n"
            . "Content-Type: text/html; charset=UTF-8\r\n\r\n"
            . $htmlBody . "\r\n"
            . '--' . $boundary . '--';

        $sent = @mail($to, $this->encodeHeader($subject), $body, implode("\r\n", $headers));

        if (!$sent) {
            error_log('[MailService] no se pudo enviar correo a ' . $to . ' (asunto: ' . $subject . ')');
        }

        return $sent;
    }

    private function encodeHeader($value)
    {
        return '=?UTF-8?B?' . base64_encode((string) $value) . '?=';
    }
}
