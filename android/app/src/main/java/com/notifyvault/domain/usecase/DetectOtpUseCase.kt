package com.notifyvault.domain.usecase

import java.util.regex.Pattern
import javax.inject.Inject

class DetectOtpUseCase @Inject constructor() {

    private val otpKeywords = listOf(
        "otp", "verification code", "security code", "one-time", "passcode",
        "رمز التحقق", "كود التحقق", "كلمة المرور لمرة واحدة", "رمز التأكيد"
    )

    private val codePattern = Pattern.compile("(?<!\\d)(\\d{4,8})(?!\\d)")

    fun execute(text: String): String? {
        val lower = text.lowercase()
        val hasKeyword = otpKeywords.any { lower.contains(it) }

        if (!hasKeyword) return null

        val matcher = codePattern.matcher(text)
        if (matcher.find()) {
            return matcher.group(1)
        }
        return null
    }

    fun maskText(text: String, code: String): String {
        return text.replace(code, "••••••")
    }
}
