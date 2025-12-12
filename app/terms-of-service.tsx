import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import { Stack, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import CommonHeader from '../components/CommonHeader'; // 导入 CommonHeader

const termsContent = {
  EN: {
    title: 'Terms of Service',
    lastUpdated: 'Last updated: December 10, 2025',
    effectiveDate: 'Effective date: December 10, 2025',
    provider: 'Provider: CampusLink Limited (Hong Kong SAR)',
    contact: 'Contact: campuslink_service@outlook.com',
    sections: [
      {
        title: '1. Acceptance and scope',
        content: [
          '• Agreement: By accessing or using the CampusLink mobile app and related web/online features (the "Service"), you agree to be bound by these Terms of Service (the "Terms") and our Privacy Policy. The current version of the Service primarily focuses on targeted messaging, Energy Points purchase, and redemption features. We may gradually introduce other community features (such as public posts, comments, interactions) in future versions.',
          '• Age and authority: You confirm you are 18 or older, or have parental/guardian consent. If you use the Service on behalf of an organization (e.g., student society, university unit, or company), you represent and warrant you are authorized to bind that organization to these Terms.'
        ]
      },
      {
        title: '2. Accounts, verification, and security',
        content: [
          '• Account creation: You must provide true, accurate, current, and complete information and keep it updated.',
          '• Campus verification: The Service is for higher-education communities. We may require verification of student, staff, or alumni status; failure or revocation may limit or terminate access to certain features.',
          '• Security: You are responsible for safeguarding credentials and all activities under your account; report unauthorized use to campuslink_service@outlook.com.',
          '• Multiple accounts and impersonation: Do not misrepresent identity, impersonate others, or create/maintain an abnormal number of accounts.'
        ]
      },
      {
        title: '3. Energy Points system',
        content: [
          '• Nature and limits: "Energy Points" are in-service virtual points, not money, e-wallets, or financial instruments; they cannot be redeemed for cash/crypto/equivalents and may not be bought, sold, or transferred off-platform.',
          '• Earning: Energy Points can be obtained by reading targeted messages or through purchase; specific earning rates, purchase prices, caps, and eligibility may be adjusted by the platform at any time. We may provide other ways to earn (e.g., referral rewards, tips) in the future, subject to the platform rules applicable at that time.',
          '• Use: Energy Points can be used to send targeted messages or to redeem non-cash rewards designated by the platform (e.g., coupons, merchandise). All redemptions are final and non-refundable/non-exchangeable, unless the relevant reward cannot be provided. We may offer the option to use Energy Points to unlock other features in the future; the supplier, availability, specific content, and required points for rewards are subject to change, and the platform does not guarantee the continued availability or stock of any reward.',
          '• Targeted message metering: Message sponsors are charged based on platform-measured effective reads; to deter spam, posting targeted messages consumes Energy Points.',
          '• Purchases and refunds: Purchases of Energy Points are generally non-refundable unless required by law; pricing, minimums, and limits may change for compliance or risk control.',
          '• Anti-abuse: Prohibit scripts, bots, emulators, device-fingerprint manipulation, abnormal foreground/background switching, or any attempt to game reads/rewards; violations may freeze/claw back points, restrict features, or terminate accounts, in addition to other remedies.'
        ]
      },
      {
        title: '4. Content policy and community safety',
        content: [
          '• Your responsibility: Verified users may post targeted messages and are solely responsible for their content.',
          '• Prohibited content: Illegal, fraudulent, defamatory, obscene, or harassing material; IP/privacy/other-rights violations; misinformation, deceptive statements, doxxing; malware or security threats.',
          '• Prohibited conduct: Data scraping/bulk collection, reverse engineering, unauthorized automation, or any manipulation/circumvention of the Energy Points system.',
          '• Moderation: We may remove content, limit distribution, reduce visibility, add labels, freeze points, or suspend/terminate accounts at our reasonable discretion, and without prior notice in urgent cases.'
        ]
      },
      {
        title: '5. Intellectual property and licenses',
        content: [
          '• Our rights: The Service, technologies, and branding are owned by CampusLink Limited or its licensors.',
          '• User content license: You retain your content rights; you grant us a worldwide, non-exclusive, sublicensable and transferable, royalty-free license to use, host, store, reproduce, display, perform, distribute, and back up your content for operating and improving the Service; after deletion, the license survives as reasonably necessary for compliance, disputes, and backups.'
        ]
      },
      {
        title: '6. Third-party services and payments',
        content: [
          '• Vendors: We may use cloud, push, analytics, identity, and payment providers subject to contractual and data-protection obligations.',
          '• Payments: Payments are processed by third parties; we do not store full payment card data. We are not liable beyond legal requirements for delays or failures attributable to third parties.'
        ]
      },
      {
        title: '7. Disclaimers and limitation of liability',
        content: [
          '• As-is: The Service is provided "as is" and "as available," without warranties of any kind.',
          '• Content and interactions: We do not guarantee the truthfulness, accuracy, or reliability of user content or interactions.',
          '• Limitation: To the maximum extent permitted by law, we are not liable for indirect, incidental, special, punitive, or consequential damages, or for lost profits/revenue/data/goodwill; non-excludable liabilities remain as required by law.'
        ]
      },
      {
        title: '8. Termination, changes, and notices',
        content: [
          '• Service changes: We may modify, suspend, or discontinue all or part of the Service at any time.',
          '• Account termination: For breaches, compliance, or risk reasons, we may restrict or terminate access; upon termination, your right to use the Service immediately ceases.',
          '• Updates: Material changes will be notified via in-app notice or email; continued use constitutes acceptance.'
        ]
      },
      {
        title: '9. Governing law and jurisdiction',
        content: [
          '• Law: These Terms are governed by the laws of the Hong Kong SAR.',
          '• Forum: Courts of Hong Kong have exclusive jurisdiction.'
        ]
      },
      {
        title: '10. Miscellaneous',
        content: [
          '• Severability: If any provision is invalid or unenforceable, the remainder remains effective.',
          '• No waiver: Failure to enforce a right is not a waiver.',
          '• Assignment: You may not assign without our written consent; we may assign in connection with merger, reorganization, or asset transfer.',
          '• Contact: campuslink_service@outlook.com.'
        ]
      }
    ]
  },
  CN: {
    title: '服务条款',
    lastUpdated: '最后更新日期：2025年12月10日',
    effectiveDate: '生效日期：2025年12月10日',
    provider: '提供方：CampusLink Limited（香港特别行政区）',
    contact: '联系邮箱：campuslink_service@outlook.com',
    sections: [
      {
        title: '1. 接受与主体',
        content: [
          '• 适用范围：您访问或使用CampusLink移动应用与相关网站/线上功能（"本服务"），即表示您同意受本服务条款（"本条款"）及《隐私政策》约束。当前版本的服务主要专注于定向信息、精力值充值与兑换功能。我们可能在未来版本中逐步增加其他社群功能（如公开信息、评论、互动等）',
          '• 年龄与授权：您确认已年满18岁，或已获得父母/法定监护人的同意。若您代表学生组织、大学部门或公司使用本服务，您声明并保证已获得合法授权并使该组织受本条款约束。'
        ]
      },
      {
        title: '2. 账户、验证与安全',
        content: [
          '• 创建账户：您须提供真实、准确、最新及完整的信息，并保持及时更新。',
          '• 校园身份验证：本平台面向高等教育社群。我们可能要求您验证为受支持院校的在读学生、教职员工或校友；未通过或撤销验证的账户，相关功能可能被限制或终止。',
          '• 账户安全：您应妥善保管登录凭证，并对账户项下全部活动负责；若发现未授权使用，请立即联系campuslink_service@outlook.com。',
          '• 多账户与冒用：禁止虚假身份、冒充他人或创建/维持异常数量的账户。'
        ]
      },
      {
        title: '3. "精力值"系统（Energy Points）',
        content: [
          '• 性质与限制："精力值"为平台内虚拟积分，非货币、非电子钱包或任何金融工具；不可兑现为现金/加密资产/等价物，且不得在平台外购买、出售或转让。',
          '• 获取方式：精力值可通过阅读定向信息或购买获得；具体获取比率、充值价格、上限与资格可由平台随时调整。我们可能在未来提供其他获取方式（如邀请奖励、赞赏等），具体以届时平台规则为准。',
          '• 使用范围：精力值可用于发布定向信息或兑换平台指定的非现金奖励（如优惠券、纪念品等）。所有兑换行为一经完成，原则上不可撤销或退换，除非相关奖励无法提供。我们可能在未来提供将精力值用于解锁其他功能的选项；奖励的供应方、可用性、具体内容及所需精力值可能随时变更，平台恕不保证任何奖励的持续提供或库存。',
          '• 定向消息计量：信息发布者将依据平台技术计量的有效阅读（按平台规则计时并汇总）承担费用；为抑制滥发，发布定向消息将消耗精力值。',
          '• 购买与退款：如通过支付渠道购买精力值，除法律强制要求外通常不接受退款；平台可基于合规或风控调整价格、最低购买量及限额。',
          '• 反作弊与滥用：禁止以脚本、机器人、模拟器、设备指纹操纵、异常切屏等方式刷取或操纵阅读与奖励；一经发现，我们可冻结/扣回精力值、限制功能或终止账户，并保留追索权。'
        ]
      },
      {
        title: '4. 内容政策与社区安全',
        content: [
          '• 用户责任：已验证用户可发布定向信息，并对其发布内容独立负责。',
          '• 禁止内容：违法、欺诈、诽谤、淫秽、骚扰；侵犯知识产权/隐私或其他权利；错误/虚假信息、误导性陈述、起底；含恶意代码或安全威胁。',
          '• 禁止行为：数据抓取与批量采集、逆向工程、未经授权的自动化访问、对精力值系统的操纵或规避。',
          '• 审核与处置：我们可依合理判断移除内容、限制传播、降低曝光、标注风险、冻结精力值、暂停或终止账户，并可在紧急情况下不事先通知。'
        ]
      },
      {
        title: '5. 知识产权与许可',
        content: [
          '• 平台权利：本服务的内容、技术与标识的所有权及相关知识产权归 CampusLink Limited 或其许可方所有。',
          '• 用户内容许可：您保留所发布内容的权利；您授予我们全球范围、非独占、可再许可与转授权、免版税的许可，用于运营、改进、展示、传播、存储与备份您的内容；在您删除内容后，该许可为合规、争议处理与备份之必要而在合理范围内存续。'
        ]
      },
      {
        title: '6. 第三方服务与支付',
        content: [
          '• 服务商：我们可能使用云计算、消息推送、数据分析、身份验证与支付等第三方服务商；其处理受相应条款与我们的数据保护要求约束。',
          '• 支付处理：支付由第三方机构处理，我们不保存完整支付卡敏感信息；因第三方原因导致的延迟或故障，我们不承担超出法律要求的责任。'
        ]
      },
      {
        title: '7. 免责声明与责任限制',
        content: [
          '• 按现状提供：本服务按"现状"与"可用性"提供，不就准确性、完整性、可用性或特定适用性作出明示或默示保证。',
          '• 内容与互动：对用户发布内容与互动行为的真实性、准确性与可靠性不承担担保责任。',
          '• 责任限制：在法律允许的最大范围内，我们不对间接、附带、特殊、惩罚性或衍生性损害，或利润/收入/数据/商誉损失负责；依法不能排除或限制的责任以法律为准。'
        ]
      },
      {
        title: '8. 终止、变更与通知',
        content: [
          '• 服务调整：我们可随时修改、暂停或终止全部或部分服务功能。',
          '• 账户终止：如您违反本条款、政策或法律，或出于合规/风控需要，我们可限制或终止您使用；终止后，您对服务的访问权立即停止。',
          '• 条款更新：对重大变更，我们将通过应用内公告或电子邮件合理通知；您继续使用即视为接受更新。'
        ]
      },
      {
        title: '9. 适用法律与争议解决',
        content: [
          '• 法律适用：本条款受香港特别行政区法律管辖并据其解释。',
          '• 管辖法院：任何争议由香港法院专属管辖。'
        ]
      },
      {
        title: '10. 其他',
        content: [
          '• 可分割性：若任一条款被认定无效或不可执行，其他条款仍有效。',
          '• 不弃权：任一方未行使权利不构成放弃。',
          '• 转让：未经我们书面同意，您不得转让本条款项下权利义务；我们可在合并、重组或资产转让时转让之。',
          '• 联系：campuslink_service@outlook.com。'
        ]
      }
    ]
  },
  HK: {
    title: '服務條款',
    lastUpdated: '最後更新日期：2025年12月10日',
    effectiveDate: '生效日期：2025年12月10日',
    provider: '提供方：CampusLink Limited（香港特別行政區）',
    contact: '聯絡電郵：campuslink_service@outlook.com',
    sections: [
      {
        title: '1. 接受與主體',
        content: [
          '• 適用範圍：您使用CampusLink流動應用及相關網站/線上功能（「本服務」），即表示同意受本服務條款（「本條款」）及《私隱政策》約束。當前版本之服務主要專注於定向訊息、精力值充值與兌換功能。我們可能於未來版本中逐步增加其他社群功能（如公開資訊、評論、互動等）。',
          '• 年齡與授權：您確認已年滿18歲，或已獲父母/法定監護人同意；如代表學生組織、院系部門或公司使用，您聲明並保證已獲合法授權並使該組織受本條款約束。'
        ]
      },
      {
        title: '2. 帳戶、驗證與安全',
        content: [
          '• 建立帳戶：提供真實、準確、最新及完整資料，並保持更新。',
          '• 校園身分驗證：本平台面向高等教育社群；未能通過或被撤銷驗證之帳戶，其相關功能可能受限或被終止。',
          '• 帳戶安全：妥善保管登入憑證，對帳戶下全部活動負責；若發現未授權使用，請即時電郵campuslink_service@outlook.com。',
          '• 多帳戶與冒用：禁止虛假身分、冒充他人或建立/維持異常數量之帳戶。'
        ]
      },
      {
        title: '3. 「精力值」系統（Energy Points）',
        content: [
          '• 性質與限制：「精力值」為平台內虛擬積分，非貨幣或任何金融工具；不可兌換現金/加密資產/等價物，亦不得於平台外買賣或轉讓。',
          '• 獲取方式：精力值可透過閱讀定向資訊或購買獲得；具體獲取比率、充值價格、上限與資格可由平台隨時調整。我們可能於未來提供其他獲取方式（如邀請獎勵、讚賞等），具體以屆時平台規則為準。',
          '• 使用範圍：精力值可用於發布定向訊息或兌換平台指定之非現金獎勵（如優惠券、紀念品等）。所有兌換行為一經完成，原則上不可撤銷或退換，除非相關獎勵無法提供。我們可能於未來提供將精力值用於解鎖其他功能之選項；獎勵之供應方、可用性、具體內容及所需精力值可能隨時變更，平台恕不保證任何獎勵之持續提供或庫存。',
          '• 定向訊息計量：資訊發布者依平台技術計量之有效閱讀承擔費用；為抑制濫發，發布定向訊息將消耗精力值。',
          '• 購買與退款：透過支付渠道購買精力值，除法律強制要求外通常不設退款；平台可基於合規或風控調整價格、最低購買量及限額。',
          '• 反作弊與濫用：禁止以腳本、機械人、模擬器、裝置指紋操縱、異常切屏等方式刷取或操縱閱讀與獎勵；一經發現，可凍結/扣回精力值、限制功能或終止帳戶，並保留追索權。'
        ]
      },
      {
        title: '4. 內容政策與社群安全',
        content: [
          '• 用戶責任：已驗證用戶可發布定向資訊，並對其內容獨立負責。',
          '• 禁止內容：非法、詐騙、誹謗、猥褻、騷擾；侵害知識產權/私隱或其他權利；錯誤/虛假資訊、誤導性陳述、起底；含惡意代碼或安全威脅。',
          '• 禁止行為：數據抓取與批量蒐集、逆向工程、未授權自動化訪問、對精力值系統之操縱或規避。',
          '• 審核與處置：我們可依合理判斷移除內容、限制傳播、降低曝光、標註風險、凍結精力值、暫停或終止帳戶，緊急情況下可不預先通知。'
        ]
      },
      {
        title: '5. 知識產權與授權',
        content: [
          '• 平台權利：本服務之內容、技術與標識之所有權及相關知識產權歸CampusLink Limited或其許可方所有。',
          '• 用戶內容授權：您保留所發布內容之權利；您授予我們全球、非獨家、可再授權與轉授權、免版稅之許可，用於營運、改進、展示、傳播、存儲與備份；您刪除內容後，該許可為合規、爭議處理與備份所需而在合理範圍內存續。'
        ]
      },
      {
        title: '6. 第三方服務與支付',
        content: [
          '• 服務供應商：可能使用雲端、推送、分析、身分驗證與支付等第三方；其處理受合約及我們的資料保護要求約束。',
          '• 支付處理：支付由第三方機構處理；我們不保存完整支付卡敏感資料；因第三方導致之延誤或故障，我們不承擔超出法律要求之責任。'
        ]
      },
      {
        title: '7. 免責與責任限制',
        content: [
          '• 按現狀提供：本服務按「現狀」及「可用性」提供，不作明示或默示保證。',
          '• 內容與互動：對用戶內容及互動之真實性、準確性與可靠性不負保證責任。',
          '• 責任限制：在法律允許範圍內，對間接、附帶、特殊、懲罰性或衍生性損害，或利潤/收入/數據/商譽損失不承擔責任；依法不得排除之責任以法律為準。'
        ]
      },
      {
        title: '8. 終止、變更與通知',
        content: [
          '• 服務調整：我們可隨時修改、暫停或終止全部或部分功能。',
          '• 帳戶終止：違反本條款/政策/法律或基於合規/風控需要，我們可限制或終止使用；終止後，您的存取權即時停止。',
          '• 條款更新：重大變更將以應用內公告或電郵合理通知；您繼續使用即視為接受。'
        ]
      },
      {
        title: '9. 適用法律與爭議解決',
        content: [
          '• 法律適用：受香港特別行政區法律管轄並據其解釋。',
          '• 管轄法院：爭議由香港法院專屬管轄。'
        ]
      },
      {
        title: '10. 其他',
        content: [
          '• 可分割性：任一條款被裁定無效或不可執行，其餘條款仍有效。',
          '• 不棄權：任一方未行使權利不構成放棄。',
          '• 轉讓：未經書面同意，您不得轉讓本條款項下之權利義務；我們可於合併、重組或資產轉讓時轉讓。',
          '• 聯絡：campuslink_service@outlook.com。'
        ]
      }
    ]
  }
};

export default function TermsOfServiceScreen() {
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

  const content = termsContent[language];

  return (
    <SafeAreaProvider>
      {/* 隐藏原生 header */}
      <Stack.Screen 
        options={{
          headerShown: false,
        }} 
      />
      {/* 修改：使用 edges={['top']} 与 followers 保持一致 */}
      <SafeAreaView style={styles.container} edges={['top']}>
        {/* 使用 CommonHeader */}
        <CommonHeader 
          onBack={() => router.back()}
          title={content.title}
        />
        
        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          <View style={styles.content}>
            <Text style={styles.lastUpdated}>{content.lastUpdated}</Text>
            <Text style={styles.effectiveDate}>{content.effectiveDate}</Text>
            <Text style={styles.provider}>{content.provider}</Text>
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
        
        {/* Language toggle button */}
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
  provider: {
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