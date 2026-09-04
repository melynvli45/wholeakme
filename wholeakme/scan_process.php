<?php require_once __DIR__ . '/includes/auth.php';
requireLogin();
$uid = $_SESSION['user_id'];
$type = $_POST['scan_type'] ?? 'email';
$target = trim($_POST['target'] ?? '');
if (!in_array($type, ['email', 'username', 'domain', 'url', 'password'], true) || $target === '') redirect('scanner.php');
$items = mockScan($type, $target);
$max = 0;
foreach ($items as $i) $max = max($max, severityScore($i['risk']));
$scanId = uuidv4();
$pdo = db();
$pdo->beginTransaction();
try {
    $pdo->prepare('INSERT INTO scans (scan_id,user_id,scan_type,target,status,risk_score,summary,created_at,completed_at) VALUES (?,?,?,?,"completed",?,?,UTC_TIMESTAMP(),UTC_TIMESTAMP())')->execute([$scanId, $uid, $type, $target, $max, count($items) . ' local heuristic finding(s) generated']);
    $emailId = null;
    if ($type === 'email' && filter_var($target, FILTER_VALIDATE_EMAIL)) {
        $q = $pdo->prepare('SELECT email_id FROM email_addresses WHERE user_id=? AND email_address=? LIMIT 1');
        $q->execute([$uid, $target]);
        $emailId = $q->fetchColumn();
        if (!$emailId) {
            $emailId = uuidv4();
            $pdo->prepare('INSERT INTO email_addresses (email_id,user_id,email_address,is_verified,is_primary,created_at,last_checked_at) VALUES (?,?,?,0,0,UTC_TIMESTAMP(),UTC_TIMESTAMP())')->execute([$emailId, $uid, $target]);
        }
    }
    $urlId = null;
    if (in_array($type, ['domain', 'url'], true)) {
        $url = $target;
        if (!preg_match('#^https?://#i', $url)) $url = 'https://' . $url;
        $domain = parse_url($url, PHP_URL_HOST) ?: $target;
        $urlId = uuidv4();
        $pdo->prepare('INSERT INTO visited_urls (url_id,scan_id,url,domain,category,risk_score,first_seen_at,last_seen_at,created_at) VALUES (?,?,?,?,?,?,?,?,UTC_TIMESTAMP())')->execute([$urlId, $scanId, $url, $domain, riskLabel($max), $max, gmdate('Y-m-d H:i:s'), gmdate('Y-m-d H:i:s')]);
    }
    foreach ($items as $i) {
        $resultId = uuidv4();
        $pdo->prepare('INSERT INTO scan_results (result_id,scan_id,result_type,title,description,risk_level,source,raw_data,created_at) VALUES (?,?,?,?,?,?,?,?,UTC_TIMESTAMP())')->execute([$resultId, $scanId, $i['type'], $i['title'], $i['description'], $i['risk'], $i['source'], json_encode(['mode' => 'local-demo'])]);
        if ($emailId && $i['type'] === 'leak') {
            $pdo->prepare('INSERT INTO breach_results (breach_result_id,email_id,source,breach_name,description,is_compromised,created_at) VALUES (?,?,"Local heuristic engine",?, ?,1,UTC_TIMESTAMP())')->execute([uuidv4(), $emailId, $i['title'], $i['description']]);
        }
        if ($urlId && in_array($i['type'], ['phishing', 'malware', 'suspicious'], true)) {
            $pdo->prepare('INSERT INTO threat_detections (threat_id,url_id,threat_type,description,severity,source,resolved,created_at) VALUES (?,?,?,?,?,"Local heuristic engine",0,UTC_TIMESTAMP())')->execute([uuidv4(), $urlId, $i['type'], $i['description'], $i['risk']]);
        }
    }
    if ($max >= 40) {
        $title = 'Security finding: ' . riskLabel($max) . ' risk';
        $msg = 'A ' . $type . ' scan produced ' . count($items) . ' finding(s) for ' . substr($target, 0, 120) . '.';
        $pdo->prepare('INSERT INTO notifications (notification_id,user_id,type,title,message,is_read,created_at) VALUES (?,?,"alert",?,?,0,UTC_TIMESTAMP())')->execute([uuidv4(), $uid, $title, $msg]);
    }
    $pdo->prepare('INSERT INTO api_logs (log_id,user_id,api_name,endpoint,request_data,response_status,response_data,created_at) VALUES (?,?,"Local heuristic engine","/scan",?,200,?,UTC_TIMESTAMP())')->execute([uuidv4(), $uid, json_encode(['type' => $type]), json_encode(['findings' => count($items), 'risk' => $max])]);
    $pdo->commit();
    redirect('scan_detail.php?id=' . $scanId);
} catch (Throwable $e) {
    $pdo->rollBack();
    die('Database error. Make sure your column names match the ERD and database. Error: ' . e($e->getMessage()));
}
