package com.gateway.admin

import retrofit2.http.GET
import retrofit2.Retrofit
import retrofit2.converter.gson.GsonConverterFactory

data class ActiveCheckoutsResponse(
    val success: Boolean,
    val activeCheckouts: List<CheckoutItem>?,
    val history: List<CheckoutItem>?
)

data class CheckoutItem(
    val id: String,
    val type: String?, // "bkash", "nagad"
    val amount: Double?,
    val payerName: String?,
    val payerPhone: String?,
    val step: Int?, // Step 1..4
    val status: String?, // "pending", "approved", etc.
    val updatedAt: Long?
)

interface CheckoutService {
    @GET("api/checkout/active")
    suspend fun getActiveCheckouts(): ActiveCheckoutsResponse
}

object RetrofitClient {
    private var instance: CheckoutService? = null
    private var cachedUrl: String = ""

    fun getService(baseUrl: String): CheckoutService {
        val normalizedUrl = if (baseUrl.endsWith("/")) baseUrl else "$baseUrl/"
        if (instance != null && cachedUrl == normalizedUrl) {
            return instance!!
        }
        cachedUrl = normalizedUrl
        val retrofit = Retrofit.Builder()
            .baseUrl(normalizedUrl)
            .addConverterFactory(GsonConverterFactory.create())
            .build()
        val service = retrofit.create(CheckoutService::class.java)
        instance = service
        return service
    }
}
