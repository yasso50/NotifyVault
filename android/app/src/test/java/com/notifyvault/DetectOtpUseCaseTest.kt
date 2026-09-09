package com.notifyvault

import com.notifyvault.domain.usecase.DetectOtpUseCase
import org.junit.Assert.assertEquals
import org.junit.Assert.assertNotNull
import org.junit.Assert.assertNull
import org.junit.Before
import org.junit.Test

class DetectOtpUseCaseTest {

    private lateinit var detectOtpUseCase: DetectOtpUseCase

    @Before
    fun setUp() {
        detectOtpUseCase = DetectOtpUseCase()
    }

    @Test
    fun detectEnglishOtp_returnsCorrectDigits() {
        val message = "Your verification code is 482910. Do not share it."
        val otp = detectOtpUseCase.execute(message)
        assertNotNull(otp)
        assertEquals("482910", otp)
    }

    @Test
    fun detectArabicOtp_returnsCorrectDigits() {
        val message = "رمز التحقق الخاص بك هو 938102 صالح لمدة 5 دقائق."
        val otp = detectOtpUseCase.execute(message)
        assertNotNull(otp)
        assertEquals("938102", otp)
    }

    @Test
    fun messageWithoutOtpKeywords_returnsNull() {
        val message = "Hey there! Are we still meeting at 4:30 pm today?"
        val otp = detectOtpUseCase.execute(message)
        assertNull(otp)
    }

    @Test
    fun maskText_replacesOtpWithBullets() {
        val message = "Your OTP code is 556677."
        val masked = detectOtpUseCase.maskText(message, "556677")
        assertEquals("Your OTP code is ••••••.", masked)
    }
}
