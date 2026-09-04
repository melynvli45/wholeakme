<?php
function uuidv4(): string {
    $data = random_bytes(16);
    $data[6] = chr((ord($data[6]) & 0x0f) | 0x40);
    $data[8] = chr((ord($data[8]) & 0x3f) | 0x80);
    return vsprintf('%s%s-%s-%s-%s-%s%s%s', str_split(bin2hex($data), 4));
}
function e($value): string { return htmlspecialchars((string)$value, ENT_QUOTES, 'UTF-8'); }
function redirect(string $path): never { header('Location: '.$path); exit; }
function riskLabel(int $score): string {
    if ($score >= 75) return 'Critical';
    if ($score >= 50) return 'High';
    if ($score >= 25) return 'Medium';
    return 'Low';
}
function riskClass(string $risk): string { return strtolower($risk); }
function recommendationFor(string $type): string {
    return match ($type) {
        'phishing' => 'Avoid the website, verify the domain, and never enter passwords or personal information.',
        'malware' => 'Leave the website, update your browser, and run a trusted endpoint security scan.',
        'leak' => 'Change affected passwords immediately and enable multi-factor authentication.',
        'tracking' => 'Review browser privacy settings and limit unnecessary third-party trackers.',
        default => 'Review the finding and apply stronger privacy and account security settings.'
    };
}
function mockScan(string $type, string $target): array {
    $target = trim($target);
    $lower = strtolower($target);
    $items = [];
    if ($type === 'email') {
        if (preg_match('/@(example|test|gmail|yahoo|outlook)\./', $lower) || str_contains($lower, 'leak')) {
            $items[] = ['type'=>'leak','title'=>'Potential credential exposure indicator','description'=>'Demo mode: the email matched a local breach simulation rule. No external API was queried.','risk'=>'High','source'=>'Local heuristic engine'];
            $items[] = ['type'=>'leak','title'=>'Repeated public exposure indicator','description'=>'Demo mode: repeated exposure pattern generated for testing dashboard behaviour.','risk'=>'Medium','source'=>'Local heuristic engine'];
        }
    } elseif ($type === 'domain' || $type === 'url') {
        $badWords = ['login','verify','secure','free','bonus','gift','update','account','bank','pay'];
        $suspicious = 0;
        foreach ($badWords as $word) if (str_contains($lower, $word)) $suspicious++;
        if (str_contains($lower, 'http://')) $suspicious++;
        if (preg_match('/\d+\.\d+\.\d+\.\d+/', $lower)) $suspicious += 2;
        if ($suspicious >= 3) $items[] = ['type'=>'phishing','title'=>'Suspicious website pattern','description'=>'The URL matched multiple phishing-style heuristic indicators in demo mode.','risk'=>'High','source'=>'Local heuristic engine'];
        elseif ($suspicious > 0) $items[] = ['type'=>'suspicious','title'=>'Suspicious website indicator','description'=>'The URL contains patterns commonly associated with social-engineering pages.','risk'=>'Medium','source'=>'Local heuristic engine'];
    } elseif ($type === 'username') {
        if (strlen($target) < 4) $items[] = ['type'=>'suspicious','title'=>'Low-uniqueness username','description'=>'Short usernames may have higher identity ambiguity across public platforms.','risk'=>'Low','source'=>'Local heuristic engine'];
    } elseif ($type === 'password') {
        if (strlen($target) < 10 || preg_match('/^(password|123456|qwerty)/i', $target)) $items[] = ['type'=>'leak','title'=>'Weak password exposure indicator','description'=>'The password matched a weak-password heuristic. The password itself is never stored in the database.','risk'=>'High','source'=>'Local heuristic engine'];
    }
    if (!$items) $items[] = ['type'=>'info','title'=>'No high-risk local indicators found','description'=>'Demo mode completed. Connect OSINT APIs later for real breach and reputation intelligence.','risk'=>'Low','source'=>'Local heuristic engine'];
    return $items;
}
function severityScore(string $risk): int { return match(strtolower($risk)) {'critical'=>95,'high'=>70,'medium'=>40,default=>10}; }
?>
