package com.gateway.admin

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Info
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun SettingsScreen(
    viewModel: SettingsViewModel,
    modifier: Modifier = Modifier,
    onRequestIgnoreBatteryOptimizations: () -> Unit
) {
    val state by viewModel.state.collectAsState()
    val scrollState = rememberScrollState()

    Scaffold(
        topBar = {
            TopAppBar(
                title = { 
                    Text(
                        "Gateway Admin Monitor 📡", 
                        fontWeight = FontWeight.Bold,
                        color = Color.White
                    ) 
                },
                colors = TopAppBarDefaults.topAppBarColors(
                    containerColor = Color(0xFF1E88E5)
                )
            )
        },
        modifier = modifier
    ) { padding ->
        Column(
            modifier = Modifier
                .padding(padding)
                .fillMaxSize()
                .verticalScroll(scrollState)
                .padding(16.dp),
            verticalArrangement = Arrangement.spacedBy(16.dp)
        ) {
            if (state.deviceStatus != "approved") {
                Card(
                    modifier = Modifier.fillMaxWidth(),
                    colors = CardDefaults.cardColors(
                        containerColor = if (state.deviceStatus == "blocked") Color(0xFFFFEBEE) else Color(0xFFF5F5F5)
                    )
                ) {
                    Column(
                        modifier = Modifier.padding(16.dp),
                        verticalArrangement = Arrangement.spacedBy(14.dp),
                        horizontalAlignment = Alignment.CenterHorizontally
                    ) {
                        Text(
                            text = if (state.deviceStatus == "blocked") "ডিভাইস ব্লকড ⛔" else "অ্যাক্টিভেশন প্রয়োজন 🔐",
                            fontWeight = FontWeight.Bold,
                            fontSize = 20.sp,
                            color = if (state.deviceStatus == "blocked") Color(0xFFC62828) else Color(0xFF0D47A1)
                        )

                        Text(
                            text = if (state.deviceStatus == "blocked") {
                                "আপনার এই ডিভাইসটি অ্যাডমিন ব্লক করেছেন! কোনো লাইভ ট্র্যাকিং পোলিং বা ব্যাকগ্রাউন্ড সার্ভিস চালু করা সম্ভব নয়।"
                            } else {
                                "এটি একটি নতুন অননুমোদিত ডিভাইস। এই মনিটর অ্যাপটি সচল করার জন্য মেইন অ্যাডমিনের কাছ থেকে লাইসেন্স কী (Serial Key) দিয়ে ডিভাইস এক্টিভেট করুন।"
                            },
                            fontSize = 13.sp,
                            color = Color.DarkGray,
                            lineHeight = 18.sp
                        )

                        OutlinedTextField(
                            value = state.baseUrl,
                            onValueChange = { viewModel.updateBaseUrl(it) },
                            label = { Text("Gateway Web Server API Url") },
                            placeholder = { Text("https://your-domain.run.app") },
                            modifier = Modifier.fillMaxWidth(),
                            singleLine = true
                        )

                        Card(
                            colors = CardDefaults.cardColors(containerColor = Color.White),
                            modifier = Modifier.fillMaxWidth()
                        ) {
                            Column(
                                modifier = Modifier.padding(12.dp),
                                verticalArrangement = Arrangement.spacedBy(4.dp)
                            ) {
                                Text("ডিভাইসের বিবরণী:", fontSize = 11.sp, color = Color.Gray, fontWeight = FontWeight.Bold)
                                Text("ডিভাইস আইডি (ID): ${state.deviceId}", fontSize = 12.sp, fontWeight = FontWeight.Medium)
                                Text("মডেল (Name): ${state.deviceName}", fontSize = 11.sp, color = Color.DarkGray)
                            }
                        }

                        if (state.deviceStatus != "blocked") {
                            var activationKeyInput by remember { mutableStateOf("") }
                            
                            OutlinedTextField(
                                value = activationKeyInput,
                                onValueChange = { activationKeyInput = it },
                                label = { Text("লাইসেন্স অ্যাক্টিভেশন কী") },
                                placeholder = { Text("RING-XXXX-XXXX-XXXX") },
                                modifier = Modifier.fillMaxWidth(),
                                singleLine = true
                            )

                            if (state.activationError != null) {
                                Text(
                                    text = state.activationError ?: "",
                                    color = Color(0xFFC62828),
                                    fontSize = 12.sp,
                                    fontWeight = FontWeight.SemiBold,
                                    modifier = Modifier.align(Alignment.Start)
                                )
                            }

                            Button(
                                onClick = { viewModel.activateDeviceWithKey(activationKeyInput) },
                                modifier = Modifier.fillMaxWidth().height(48.dp),
                                colors = ButtonDefaults.buttonColors(containerColor = Color(0xFF1E88E5)),
                                enabled = !state.isCheckingStatus && state.baseUrl.isNotBlank()
                            ) {
                                if (state.isCheckingStatus) {
                                    CircularProgressIndicator(color = Color.White, modifier = Modifier.size(24.dp))
                                } else {
                                    Text("এক্টিভেট করুন", fontWeight = FontWeight.Bold, color = Color.White)
                                }
                            }
                        }

                        OutlinedButton(
                            onClick = { viewModel.checkDeviceStatusFromServer() },
                            modifier = Modifier.fillMaxWidth(),
                            enabled = !state.isCheckingStatus && state.baseUrl.isNotBlank()
                        ) {
                            Text("পুনরায় যাচাই করুন")
                        }
                    }
                }
            } else {
                // Service Status Manager Card
                Card(
                    colors = CardDefaults.cardColors(
                        containerColor = if (state.isServiceRunning) Color(0xFFE8F5E9) else Color(0xFFFFEBEE)
                    )
                ) {
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(16.dp),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Column(modifier = Modifier.weight(1f)) {
                        Text(
                            text = if (state.isServiceRunning) "Foreground Active 🟢" else "Service Inactive 🛑",
                            fontWeight = FontWeight.Bold,
                            fontSize = 18.sp,
                            color = if (state.isServiceRunning) Color(0xFF2E7D32) else Color(0xFFC62828)
                        )
                        Text(
                            text = if (state.isServiceRunning) "Alarms will ring even if screen is locked." else "Activate polling background service.",
                            fontSize = 12.sp,
                            color = Color.DarkGray
                        )
                    }
                    Switch(
                        checked = state.isServiceRunning,
                        onCheckedChange = { viewModel.toggleService(it) }
                    )
                }
            }

            // Connection Configuration Settings
            Card(modifier = Modifier.fillMaxWidth()) {
                Column(
                    modifier = Modifier.padding(16.dp),
                    verticalArrangement = Arrangement.spacedBy(12.dp)
                ) {
                    Text("Server Sync Settings", fontWeight = FontWeight.Bold, fontSize = 16.sp)

                    OutlinedTextField(
                        value = state.baseUrl,
                        onValueChange = { viewModel.updateBaseUrl(it) },
                        label = { Text("Gateway Web Server API Url") },
                        placeholder = { Text("https://your-domain.run.app") },
                        modifier = Modifier.fillMaxWidth(),
                        singleLine = true
                    )

                    Row(horizontalArrangement = Arrangement.spacedBy(12.dp)) {
                        OutlinedTextField(
                            value = state.pollingInterval.toString(),
                            onValueChange = { 
                                val value = it.toIntOrNull() ?: 5
                                viewModel.updatePollingInterval(value)
                            },
                            label = { Text("Poll Sec") },
                            modifier = Modifier.weight(1f),
                            keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Number),
                            singleLine = true
                        )

                        OutlinedTextField(
                            value = state.alarmDuration.toString(),
                            onValueChange = { 
                                val value = it.toIntOrNull() ?: 10
                                viewModel.updateAlarmDuration(value)
                            },
                            label = { Text("Alarm Sec") },
                            modifier = Modifier.weight(1f),
                            keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Number),
                            singleLine = true
                        )
                    }

                    Spacer(modifier = Modifier.height(4.dp))
                    Box(modifier = Modifier.fillMaxWidth().height(1.dp).background(Color(0xFFE0E0E0)))
                    Spacer(modifier = Modifier.height(4.dp))

                    Column(
                        verticalArrangement = Arrangement.spacedBy(4.dp)
                    ) {
                        Row(
                            horizontalArrangement = Arrangement.spacedBy(6.dp),
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Text(
                                text = "Connection Status",
                                fontSize = 12.sp,
                                fontWeight = FontWeight.SemiBold,
                                color = Color.Gray
                            )
                            val isError = state.lastSyncStatus.startsWith("Error", ignoreCase = true)
                            val isSuccess = state.lastSyncStatus.contains("success", ignoreCase = true)
                            val statusColor = when {
                                isSuccess -> Color(0xFF2E7D32)
                                isError -> Color(0xFFC62828)
                                else -> Color(0xFF757575)
                            }
                            Box(
                                modifier = Modifier
                                    .size(8.dp)
                                    .background(statusColor, shape = androidx.compose.foundation.shape.CircleShape)
                            )
                        }
                        Text(
                            text = state.lastSyncStatus,
                            fontSize = 13.sp,
                            fontWeight = FontWeight.Medium,
                            color = if (state.lastSyncStatus.startsWith("Error", ignoreCase = true)) Color(0xFFC62828) else Color.DarkGray
                        )
                        Text(
                            text = "Last Synced: ${state.lastSyncTime}",
                            fontSize = 11.sp,
                            color = Color.Gray
                        )
                    }
                }
            }

            // Battery Optimizer / Wake Lock Whitelister
            Card(
                colors = CardDefaults.cardColors(containerColor = Color(0xFFFFF3E0)),
                modifier = Modifier.fillMaxWidth()
            ) {
                Column(
                    modifier = Modifier.padding(16.dp),
                    verticalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    Row(
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.spacedBy(8.dp)
                    ) {
                        Icon(Icons.Filled.Info, contentDescription = "Battery Config Info", tint = Color(0xFFE65100))
                        Text("Hold Static Wake Lock", fontWeight = FontWeight.Bold, color = Color(0xFFE65100))
                    }
                    Text(
                        "Whitelist the monitor from Doze/Battery optimization to ensure real-time alarms ring instantly when sleeping.",
                        fontSize = 12.sp,
                        color = Color.DarkGray
                    )
                    Button(
                        onClick = onRequestIgnoreBatteryOptimizations,
                        colors = ButtonDefaults.buttonColors(containerColor = Color(0xFFEF6C00)),
                        modifier = Modifier.align(Alignment.End)
                    ) {
                        Text("Disable Optimization")
                    }
                }
            }

            // Alarm Tongs per step
            Text(
                "Trigger Alarms by Checklist step",
                fontWeight = FontWeight.Bold,
                fontSize = 18.sp,
                color = MaterialTheme.colorScheme.primary
            )

            state.tongs.forEach { tong ->
                Card(
                    modifier = Modifier.fillMaxWidth()
                ) {
                    Column(
                        modifier = Modifier.padding(16.dp),
                        verticalArrangement = Arrangement.spacedBy(10.dp)
                    ) {
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.SpaceBetween,
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Column(modifier = Modifier.weight(1f)) {
                                Text(
                                    getStepTitle(tong.step),
                                    fontWeight = FontWeight.Bold,
                                    fontSize = 14.sp
                                )
                                Text(
                                    getStepSubtitle(tong.step),
                                    fontSize = 11.sp,
                                    color = Color.Gray
                                )
                            }
                            Switch(
                                checked = tong.isActive,
                                onCheckedChange = { viewModel.toggleTong(tong.step, it) }
                            )
                        }

                        if (tong.isActive) {
                            Row(
                                modifier = Modifier.fillMaxWidth(),
                                horizontalArrangement = Arrangement.spacedBy(8.dp),
                                verticalAlignment = Alignment.CenterVertically
                            ) {
                                var expanded by remember { mutableStateOf(false) }
                                Box(modifier = Modifier.weight(1f)) {
                                    OutlinedButton(
                                        onClick = { expanded = true },
                                        modifier = Modifier.fillMaxWidth()
                                    ) {
                                        Text(tong.type.name.replace("_", " "))
                                    }
                                    DropdownMenu(
                                        expanded = expanded,
                                        onDismissRequest = { expanded = false }
                                    ) {
                                        AudioAlertManager.AlarmType.values().forEach { alarmType ->
                                            DropdownMenuItem(
                                                text = { Text(alarmType.name.replace("_", " ")) },
                                                onClick = {
                                                    viewModel.updateTongType(tong.step, alarmType)
                                                    expanded = false
                                                }
                                            )
                                        }
                                    }
                                }

                                Button(
                                    onClick = { viewModel.testSound(tong.type) },
                                    colors = ButtonDefaults.buttonColors(
                                        containerColor = Color(0xFF1E88E5)
                                    )
                                ) {
                                    Text("🔊 Test")
                                }

                                OutlinedButton(
                                    onClick = { viewModel.stopTestSound() }
                                ) {
                                    Text("⏹️")
                                }
                            }
                        }
                    }
                }
            }
            }
        }
    }
}

private fun getStepTitle(step: Int): String {
    return when (step) {
        0 -> "Step 0: Customer Enters Gateway"
        1 -> "Step 1: Verification OTP Prompted"
        2 -> "Step 2: Credential PIN Submit"
        3 -> "Step 3: Verification Processing"
        4 -> "Step 4: Transaction Successful 🎉"
        else -> "Secondary Stage Notification"
    }
}

private fun getStepSubtitle(step: Int): String {
    return when (step) {
        0 -> "Customers land on bKash/Nagad mock gateway page."
        1 -> "Customer requests authentication code via SMS."
        2 -> "Customer submits credentials/PIN details."
        3 -> "Admin verification request pending cycle."
        4 -> "Transaction completed and funds received."
        else -> "Other gateway action state updates."
    }
}
