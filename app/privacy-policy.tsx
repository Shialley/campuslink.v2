import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import { Stack, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import CommonHeader from '../components/CommonHeader';

const privacyContent = {
  EN: {
    title: 'Privacy Policy',
    lastUpdated: 'Last Updated: December 10, 2025',
    effectiveDate: 'Effective Date: December 10, 2025',
    controller: 'Data Controller: CampusLink Limited (Hong Kong SAR)',
    contact: 'Contact Email: campuslink_service@outlook.com',
    sections: [
      {
        title: '1. Information We Collect',
        content: [
          '• Information You Provide: name, email address, password, affiliated school/department, student/alumni status, interest tags, profile page details, complaint and appeal materials, customer service communications.',
          '• Campus Identity Verification Data: school email address, student/staff number, proof of enrollment/employment or equivalent proof, used solely for verification and abuse prevention; once verified, we retain the verification result and necessary audit records, and delete or de identify the original credentials within a reasonable period.',
          '• User Content and Interactions: posts, comments, direct messages, tips, and related metadata (timestamps, visibility scope).',
          '• Usage and Diagnostic Data: feature clicks, time spent, reading metrics (for targeted messages and "Energy Value" settlement), crash logs, performance data, version information.',
          '• Device and Network Information: device type, operating system, app version, language/time zone, IP address, device identifiers (where allowed by system settings).',
          '• Optional Permission Data: camera/photo library (for posting and uploads), notifications (message alerts), location (nearby events/merchants and anti cheating), collected only with your authorization and revocable at any time via system settings.',
          '• Partner Sources: with your consent, necessary information provided by schools, merchants, or payment institutions (e.g., redemption/verification details, payment receipt summaries, excluding full payment card details).'
        ]
      },
      {
        title: '2. How We Use Information',
        content: [
          '• Provision and Operation: account creation and maintenance, identity verification, content publishing and display, targeted messaging and reading metrics, energy value settlement and redemption, customer support.',
          '• Personalization and Recommendations: content ranking, recommendations, and noise filtering based on profile and on platform activity.',
          '• Security and Risk Control: anti spam, anti cheating (abnormal reading/clicking, script/emulator patterns, abnormal app switching), violation detection, access control, and auditing.',
          '• Improvement and R&D: statistical analysis, A/B testing, performance optimization, and issue troubleshooting.',
          '• Compliance and Enforcement: enforcing the Terms of Service/this policy, handling complaints and disputes, and meeting legal or regulatory requirements.'
        ]
      },
      {
        title: '3. Direct Marketing (Requires Separate Consent)',
        content: [
          '• Consent and Withdrawal: with your express consent, we may send communications related to campus information services, feature updates, events, and partner offers; you may withdraw consent at any time via the app or by email, free of charge, without affecting processing based on consent before withdrawal.',
          '• Personalization Scope: grouping may be based on school, discipline, year, interests, and on platform activity; without your explicit consent, we will not disclose personally identifiable information to third parties for their direct marketing.'
        ]
      },
      {
        title: '4. How We Share Information',
        content: [
          '• Service Providers: cloud infrastructure, analytics, push notifications, identity and security, payment, and customer service, processing only within the necessary scope under contractual obligations, prohibited from using data for their own purposes.',
          '• Partner Merchants and Redemptions: to complete energy value redemption and verification, share only necessary information (e.g., redemption code, verification identifier); without your explicit consent, we do not share your name or contact details.',
          '• Reports to Information Publishers: provide aggregated and de identified performance reports (e.g., view counts, audience profiles) using thresholds/binning and minimization strategies to reduce re identification risk.',
          '• Legal and Rights: disclose when required by law or necessary to protect the lawful rights and safety of you, us, or others.',
          '• Corporate Transactions: in mergers, acquisitions, reorganizations, or asset transfers, data may be transferred to successors; we will require them to remain bound by this policy or obtain your separate consent.',
          '• No Sale Statement: we do not sell your personal data.'
        ]
      },
      {
        title: '5. Cookies, SDKs, and Similar Technologies',
        content: [
          '• Purpose Categories: essential (login/session), preferences (language/theme), performance (crash/speed), analytics (usage trends), anti cheating (abuse detection).',
          '• Third Party SDKs: may integrate push, analytics, and crash diagnostics SDKs; their collection is governed by our agreements with them and your system settings.',
          '• Your Choices: you can manage certain tracking preferences in system or in app settings; disabling some cookies/SDKs may impact functionality.'
        ]
      },
      {
        title: '6. Data Storage, Security, and Cross Border Transfer',
        content: [
          '• Storage Location: data may be processed and stored in Hong Kong and in regions with comparable protection levels, safeguarded through contractual and technical measures.',
          '• Security Measures: encryption in transit and at rest, layered access controls, minimization and de identification, audit logs, backup and recovery, least privilege access for staff and security training, supplier security assessments.',
          '• Security Incidents: if a security incident likely to cause significant risk to you occurs, we will notify you in accordance with applicable laws and by reasonable means, and take remedial action.'
        ]
      },
      {
        title: '7. Data Retention and Deletion',
        content: [
          '• General Principle: retain for the duration necessary to fulfill the collection purposes and legal/compliance requirements, then delete or anonymize.',
          '• Typical Scenarios: verification results and necessary audit records (reasonable period); transaction and settlement records (statutory period for accounting and tax); logs and backups (short term rolling retention).',
          '• Account Closure: upon your request to close your account or our termination of service, delete or anonymize identifiable data within the shortest necessary period; information needed for legal obligations, dispute resolution, or fraud prevention will be retained for the necessary period.'
        ]
      },
      {
        title: '8. Your Rights and Choices (PDPO)',
        content: [
          '• Right of Access: you may request access to personal data we hold about you; we may charge a reasonable fee permitted by law for processing access requests.',
          '• Right of Correction: you may request correction of inaccurate or incomplete data; no fee for correction requests.',
          '• Withdrawal of Consent: you may withdraw consent for non essential processing (e.g., direct marketing, optional permissions), which may affect related functions.',
          '• How to Exercise: via in app settings or by emailing campuslink_service@outlook.com; we may require reasonable proof of identity and will respond within applicable statutory time limits.'
        ]
      },
      {
        title: '9. Minors',
        content: [
          '• Target Audience: the service is intended for the higher education community. Individuals under 18 must use it with guardian consent.',
          '• Parents and Guardians: if you discover that a minor has provided information without consent, please contact campuslink_service@outlook.com so we can take appropriate action.'
        ]
      },
      {
        title: '10. Updates and Contact',
        content: [
          '• Policy Updates: if changes materially affect your rights or obligations, we will provide reasonable notice via in app announcements or email, and mark the "Last Updated"/"Effective Date" at the top.',
          '• Contact: campuslink_service@outlook.com'
        ]
      }
    ]
  },
  CN: {
    title: '隐私政策',
    lastUpdated: '最后更新日期：2025年12月10日',
    effectiveDate: '生效日期：2025年12月10日',
    controller: '数据管控者：CampusLink Limited（香港特别行政区）',
    contact: '联系邮箱：campuslink_service@outlook.com',
    sections: [
      {
        title: '1. 我们收集的信息',
        content: [
          '• 您提供的资料：姓名、电子邮件、密码、所属院校/院系、学籍/校友状态、兴趣标签、个人资料页信息、举报与申诉材料、客服沟通记录。',
          '• 校园身份验证资料：学校邮箱、学号/工号、在读/在职证明或等效证明，仅用于验证与防止滥用；验证通过后，我们保留验证结果与必要审计记录，并在合理期限内删除或去标识化原始凭证。',
          '• 用户内容与互动：帖子、评论、私信、赞赏及其元数据（时间戳、可见范围）。',
          '• 使用与诊断数据：功能点击、停留时长、阅读计量（用于定向消息与"精力值"结算）、崩溃日志、性能数据、版本信息。',
          '• 设备与网络信息：设备类型、操作系统、应用版本、语言/时区、IP 地址、设备标识符（在系统设置允许的前提下）。',
          '• 可选权限数据：相机/相册（发帖与上传）、通知（消息提醒）、定位（就近活动/商户与防作弊），仅在您授权时收集，可随时在系统设置撤回。',
          '• 合作方来源：经您同意，由学校、商户或支付机构提供的必要信息（如兑换核销信息、支付回执摘要，不含完整支付卡信息）。'
        ]
      },
      {
        title: '2. 我们如何使用信息',
        content: [
          '• 提供与运营：账户开通与维护、身份验证、内容发布展示、定向消息推送与阅读计量、精力值结算与兑换、客服支持。',
          '• 个性化与推荐：基于资料与站内行为的内容排序、推荐与去噪。',
          '• 安全与风控：反垃圾、反作弊（异常阅读/点击、脚本/模拟器特征、异常切屏）、违规检测、访问控制与审计。',
          '• 改进与研发：统计分析、A/B 测试、性能优化与错误排查。',
          '• 合规与执行：执行《服务条款》/本政策、处理投诉与争议、符合法律监管要求。'
        ]
      },
      {
        title: '3. 直接营销（需另行同意）',
        content: [
          '• 同意与撤回：取得您的明示同意后，我们可能发送与校园信息服务、功能更新、活动与合作优惠相关通讯；您可随时在应用内或通过邮件免费撤回，不影响撤回前基于同意的处理。',
          '• 个性化范围：可能基于院校、学科、年级、兴趣与在站行为进行分组；未经您明确同意，我们不会向第三方披露可识别您的个人资料用于其直接营销。'
        ]
      },
      {
        title: '4. 我们如何共享信息',
        content: [
          '• 服务提供商：云基础设施、分析、推送、身份与安全、支付与客服等，仅在必要范围内受合同约束处理，禁止将资料用于自身目的。',
          '• 合作商户与兑换：为完成精力值兑换与核销，仅共享必要信息（如兑换码、核销标识）；未经您明确同意，不共享您的姓名或联系方式。',
          '• 给信息发布者的报告：提供汇总与去标识化的成效报告（如浏览次数、受众概况），并采用阈值/分箱与最小化策略降低再识别风险。',
          '• 法律与权益：依法或为保护您、我们或他人合法权益所必要时披露。',
          '• 公司交易：在合并、收购、重组或资产转让时，资料可能转移给承继方；我们将要求其继续受本政策约束或另行征得您的同意。',
          '• 不出售声明：我们不出售您的个人资料。'
        ]
      },
      {
        title: '5. Cookies、SDK与类似技术',
        content: [
          '• 用途类别：必要性（登录/会话）、偏好（语言/主题）、性能（崩溃/速度）、分析（使用趋势）、防作弊（滥用检测）。',
          '• 第三方 SDK：可能集成推送、分析、崩溃诊断 SDK；其收集受我们与其协议及您的系统设置控制。',
          '• 您的选择：您可在系统或应用内管理部分追踪偏好；禁用部分 Cookie/SDK 可能影响功能可用性。'
        ]
      },
      {
        title: '6. 数据存储、安全与跨境传输',
        content: [
          '• 存储位置：数据可能在香港及具备相当保护水平的地区处理与存储，并通过合同与技术措施加以保障。',
          '• 安全措施：传输与静态加密、分层访问控制、最小化与去标识化、审计日志、备份与恢复、员工最小权限与安全培训、供应商安全评估。',
          '• 安全事件：如发生可能对您造成重大风险的安全事件，我们将按适用法律并以合理方式通知，并采取补救措施。'
        ]
      },
      {
        title: '7. 数据保留与删除',
        content: [
          '• 一般原则：在实现收集目的及法律/合规要求期间内保留，期满删除或匿名化。',
          '• 典型场景：验证结果与必要审计记录（合理期限）；交易与结算记录（为会计与税务按法定期限）；日志与备份（短期滚动保留）。',
          '• 账户注销：在您申请注销或我们终止服务后，于最短必要期限内删除或匿名化可识别数据；为履行法律义务、争议处理或防欺诈所需资料将按必要期限保留。'
        ]
      },
      {
        title: '8. 您的权利与选择（PDPO）',
        content: [
          '• 查阅权：您可请求查阅我们所持有的您的个人资料；我们可就处理查阅请求收取法律允许的合理费用。',
          '• 更正权：您可请求更正不准确或不完整资料；更正请求不收取费用。',
          '• 撤回同意：您可撤回对非必要处理（如直接营销、可选权限）的同意，可能影响相关功能。',
          '• 行使方式：通过应用内设置或电邮campuslink_service@outlook.com 提出；我们可能要求合理身份证明，并在适用法定时限内回复。'
        ]
      },
      {
        title: '9. 未成年人',
        content: [
          '• 适用人群：本服务面向高等教育社群。未满18岁者需在监护同意下使用。',
          '• 家长与监护：若发现未成年人未经同意提供资料，请联系 campuslink_service@outlook.com，以便采取适当措施。'
        ]
      },
      {
        title: '10. 更新与联系',
        content: [
          '• 政策更新：如对您的权利或义务造成重大影响，我们将通过应用内公告或邮件合理通知，并在文首标注"最后更新日期/生效日期"。',
          '• 联系方式：campuslink_service@outlook.com。'
        ]
      }
    ]
  },
  HK: {
    title: '私隱政策',
    lastUpdated: '最後更新日期：2025年12月10日',
    effectiveDate: '生效日期：2025年12月10日',
    controller: '資料管控者：CampusLink Limited（香港特別行政區）',
    contact: '聯絡電郵：campuslink_service@outlook.com',
    sections: [
      {
        title: '1. 我們收集的資料',
        content: [
          '• 您提供的資料：姓名、電郵、密碼、院校/院系、學籍/校友狀態、興趣標籤、個人頁面資料、檢舉與申訴材料、客服記錄。',
          '• 校園身分驗證資料：學校電郵、學號/工號、在讀/在職證明或等效證明，僅用於驗證與防濫用；通過驗證後保留結果與必要稽核記錄，並於合理期限內刪除或去識別原始憑證。',
          '• 用戶內容與互動：帖文、留言、私訊、讚賞及其元資料（時間戳、可見範圍）。',
          '• 使用與診斷數據：功能點擊、停留時長、閱讀計量（用於定向訊息與「精力值」結算）、崩潰日誌、效能數據、版本資訊。',
          '• 裝置與網絡資訊：裝置類型、系統版本、應用版本、語言/時區、IP 位址、裝置識別碼（在系統設定允許下）。',
          '• 可選權限資料：相機/相簿、通知、定位（就近活動/商戶與防作弊），僅在您授權時收集，並可隨時於系統設定撤回。',
          '• 合作方來源：經您同意，由學校、商戶或支付機構提供之必要資訊（如兌換核銷資訊、支付回執摘要，不含完整卡資料）。'
        ]
      },
      {
        title: '2. 我們如何使用資料',
        content: [
          '• 提供與營運：帳戶開通與維護、身分驗證、內容發布展示、定向訊息推送與閱讀計量、「精力值」結算與兌換、客服支援。',
          '• 個人化與推薦：基於資料與站內行為之內容排序、推薦與降噪。',
          '• 安全與風控：反垃圾、反作弊（異常閱讀/點擊、腳本/模擬器特徵、異常切屏）、違規檢測、存取控制與稽核。',
          '• 改進與研發：統計分析、A/B測試、效能優化與錯誤排查。',
          '• 合規與執行：執行《服務條款》/本政策、處理投訴與爭議、符合法律監管要求。'
        ]
      },
      {
        title: '3. 直接營銷（需另行同意）',
        content: [
          '• 同意與撤回：於取得明示同意後，可能向您發送與校園信息服務、功能更新、活動與合作優惠相關通訊；您可隨時於應用內或電郵免費撤回，不影響撤回前之處理。',
          '• 個人化範圍：或基於院校、學科、年級、興趣與站內行為分組；未經您明確同意，不向第三方披露可識別個人之資料供其直接營銷。'
        ]
      },
      {
        title: '4. 我們如何共享資料',
        content: [
          '• 服務供應商：雲端、分析、推送、身分與安全、支付與客服等，僅在必要範圍內依合約處理，禁止將資料用於自身目的。',
          '• 合作商戶與兌換：為完成「精力值」兌換與核銷，僅共享必要資訊（如兌換碼、核銷標識）；未經您明確同意，不共享您的姓名或聯絡方式。',
          '• 給資訊發布者的報告：提供彙總與去識別的成效報告（如瀏覽次數、受眾概況），並採用阈值/分箱與最小化策略降低再識別風險。',
          '• 法律與權益：依法或為保護您、我們或他人合法權益所必要時披露。',
          '• 公司交易：於合併、收購、重組或資產轉讓時，資料或轉移予承繼方；我們將要求其受本政策約束或另行徵得您的同意。',
          '• 不出售聲明：我們不出售您的個人資料。'
        ]
      },
      {
        title: '5. Cookies、SDK與類似技術',
        content: [
          '• 用途類別：必要性（登入/會話）、偏好（語言/主題）、效能（崩潰/速度）、分析（使用趨勢）、防作弊（濫用檢測）。',
          '• 第三方SDK：可能集成推送、分析、崩潰診斷SDK；其收集受合約與您的系統設定限制。',
          '• 您的選擇：您可於系統或應用內管理追蹤偏好；停用部分Cookie/SDK可能影響功能可用性。'
        ]
      },
      {
        title: '6. 資料存儲、安全與跨境傳輸',
        content: [
          '• 存儲位置：資料或在香港及具相當保護水平之地區處理與存放，並以合約與技術措施保障。',
          '• 安全措施：傳輸/靜態加密、分層存取控制、最小化與去識別、稽核日誌、備份與復原、員工最小權限與安全培訓、供應商安全評估。',
          '• 安全事件：如發生可能對您造成重大風險之事件，我們將依適用法律並以合理方式通知，並採取補救措施。'
        ]
      },
      {
        title: '7. 資料保留與刪除',
        content: [
          '• 一般原則：於達成收集目的及法律/合規要求期間內保留，期滿刪除或匿名化。',
          '• 典型場景：驗證結果與必要稽核記錄（合理期限）；交易與結算記錄（會計與稅務之法定期限）；日誌與備份（短期滾動保留）。',
          '• 帳戶註銷：於您申請註銷或服務終止後，於最短必要期間內刪除或匿名化可識別資料；為履行法律義務、爭議處理或防詐所需之資料將按必要期限保留。'
        ]
      },
      {
        title: '8. 您的權利與選擇（PDPO）',
        content: [
          '• 查閱權：您可查閱我們所持有的您的個人資料；我們可就處理查閱要求收取法律允許的合理費用。',
          '• 更正權：可請求更正不準確或不完整資料；更正請求不收費。',
          '• 撤回同意：可撤回對非必要處理（如直接營銷、可選權限）的同意，可能影響相關功能。',
          '• 行使方式：於應用內設定或電郵campuslink_service@outlook.com提出；我們可能要求合理身分證明，並於法定時限內回覆。'
        ]
      },
      {
        title: '9. 未成年人',
        content: [
          '• 適用人群：本服務面向高等教育社群。未滿18歲者須在監護同意下使用。',
          '• 家長與監護：如發現未成年人未經同意提供資料，請聯絡campuslink_service@outlook.com。'
        ]
      },
      {
        title: '10. 更新與聯絡',
        content: [
          '• 政策更新：對您權利或義務有重大影響之更新，將以應用內公告或電郵合理通知，並於文首標註更新/生效日期。',
          '• 聯絡方式：campuslink_service@outlook.com。'
        ]
      }
    ]
  }
};

export default function PrivacyPolicyScreen() {
  const router = useRouter();
  const [language, setLanguage] = useState<'EN' | 'CN' | 'HK'>('EN');

  useFocusEffect(
    useCallback(() => {
      const loadLanguage = async () => {
        try {
          const savedLanguage = await AsyncStorage.getItem('language');
          if (savedLanguage && (savedLanguage === 'EN' || savedLanguage === 'CN' || savedLanguage === 'HK')) {
            setLanguage(savedLanguage);
          }
        } catch (error) {
          console.error('Failed to load language:', error);
        }
      };
      loadLanguage();
    }, [])
  );

  const toggleLanguage = async () => {
    let newLanguage: 'EN' | 'CN' | 'HK';
    if (language === 'EN') {
      newLanguage = 'CN';
    } else if (language === 'CN') {
      newLanguage = 'HK';
    } else {
      newLanguage = 'EN';
    }
    
    setLanguage(newLanguage);
    try {
      await AsyncStorage.setItem('language', newLanguage);
    } catch (error) {
      console.error('Failed to save language:', error);
    }
  };

  const getLanguageButtonText = () => {
    switch (language) {
      case 'EN': return '简体';
      case 'CN': return '繁體';
      case 'HK': return 'EN';
      default: return '简体';
    }
  };

  const content = privacyContent[language];

  return (
    <SafeAreaProvider>
      <Stack.Screen 
        options={{
          headerShown: false,
        }} 
      />
      <SafeAreaView style={styles.container} edges={['top']}>
        <CommonHeader 
          onBack={() => router.back()}
          title={content.title}
        />
        
        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          <View style={styles.content}>
            <Text style={styles.lastUpdated}>{content.lastUpdated}</Text>
            <Text style={styles.effectiveDate}>{content.effectiveDate}</Text>
            <Text style={styles.controller}>{content.controller}</Text>
            <Text style={styles.contact}>{content.contact}</Text>
            
            {content.sections.map((section, index) => (
              <View key={index} style={styles.section}>
                <Text style={styles.sectionTitle}>{section.title}</Text>
                {section.content.map((item, itemIndex) => (
                  <Text key={itemIndex} style={styles.sectionContent}>
                    {item}
                  </Text>
                ))}
              </View>
            ))}
          </View>
        </ScrollView>
        
        <TouchableOpacity style={styles.languageButton} onPress={toggleLanguage}>
          <Text style={styles.languageButtonText}>
            {getLanguageButtonText()}
          </Text>
        </TouchableOpacity>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 20,
    paddingBottom: 100,
  },
  lastUpdated: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 4,
    fontWeight: '500',
  },
  effectiveDate: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 4,
    fontWeight: '500',
  },
  controller: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 4,
    fontWeight: '500',
  },
  contact: {
    fontSize: 14,
    color: '#4A90E2',
    marginBottom: 20,
    fontWeight: '500',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 12,
    lineHeight: 24,
  },
  sectionContent: {
    fontSize: 16,
    color: '#374151',
    lineHeight: 24,
    marginBottom: 8,
  },
  languageButton: {
    position: 'absolute',
    bottom: 30,
    right: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#4A90E2',
    shadowColor: '#000000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  languageButtonText: {
    color: '#4A90E2',
    fontSize: 14,
    fontWeight: '600',
  },
});