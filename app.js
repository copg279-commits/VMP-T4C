const LOGO_JUDICIAL = "T4C.png";
const LOGO_GAD = "logogad.png";
const ICON_CILOMOTOR = "CICLOMOTOR.png";
const ICON_MOTO = "MOTO.png";
const ICON_VMP = "VMPPLACA.png";

window.addEventListener('auth-success', function() {
    document.getElementById('head-logo-left').src = LOGO_JUDICIAL;
    document.getElementById('head-logo-right').src = LOGO_GAD;
    document.getElementById('res-logo-left').src = LOGO_JUDICIAL;
    document.getElementById('res-logo-right').src = LOGO_GAD;
    
    const imgs = document.querySelectorAll('img');
    imgs.forEach(img => img.onerror = function(){ 
        if(this.parentElement.id !== 'res-plate-container') { this.style.visibility='hidden'; }
    });
    app.renderStep('start');
});

const app = {
    currentInfractionData: null, currentMode: 'driver', isAdminSwitched: false, 
    
    resultsDB: {
        "r_vmp_vpl": {
            title: "VMP - VPL (LIGERO)", icon: "🛴", style: "admin", matIconType: "vmp",
            perm: "Ninguno", seg: "OBLIGATORIO (VPL)", mat: "Registro DGT (Chapa/QR)", casco: "Consultar Ordenanza Mun.",
            text: "✅ <b>VPL (Vehículo Personal Ligero)</b><br>Peso < 25kg ó (Peso > 25kg y Vel < 14km/h).<br>No se considera vehículo a motor, pero requiere Seguro.<br><b>Sanción SOA:</b> 300€ (Circular) / 200€ (Titular).<br><br>ℹ️ <b>NOTA PENAL:</b> No aplica Art. 384 CP salvo manipulación.<br>🏗️ <b>GRÚA:</b> No procede retirada automática. Solo si el infractor se niega a retirar el vehículo de la vía por sus propios medios (Art 105 LSV).",
            infractions: {
                admin: { 
                    default: { 
                        norm: "Art. 22 bis RGV", 
                        opt: "VEH.22.B-2.5A", 
                        amount: "200 €", 
                        reduced: "100 €", 
                        text: "Carecer del certificado de circulación.<br><br>⚠️ <i>REGLA BUCLE: NO formular denuncias a la vez por no tener certificado (5A) y no estar inscrito (5B) o carecer de chapa (5C).</i>", 
                        action: "RETIRADA A CARGO DEL INFRACTOR" 
                    },
                    alt: { 
                        norm: "Art. 22 bis RGV", 
                        opt: "VEH.22.B-2.5C", 
                        amount: "80 €", 
                        reduced: "40 €", 
                        text: "No disponer o exhibir la etiqueta identificativa (M/Z) o la placa de marcaje de fabricante.<br><br>⚠️ <i>REGLA BUCLE: NO denunciar por falta de etiqueta si el vehículo no está inscrito (5B).</i>", 
                        action: "RETIRADA A CARGO DEL INFRACTOR" 
                    }
                },
                soa: { type: "vpl", driver: { opt: "SDA.1.5A", amount: 300, text: "Circular el VPL sin que conste seguro de responsabilidad civil en vigor. (Indicar nº identificación en boletín)." }, owner: { opt: "SDA.1.5B", amount: 200, text: "Incumplir el titular la obligación de suscribir o mantener seguro (vehículo estacionado o no circulando)." } }
            }
        },
        "r_vmp_motor": {
            title: "VMP (>25KG Y >14KM/H)", icon: "🛴", style: "admin", matIconType: "vmp",
            perm: "Ninguno", seg: "OBLIGATORIO (MOTOR)", mat: "Registro DGT (Chapa/QR)", casco: "Consultar Ordenanza Mun.",
            text: "⚠️ <b>VMP ASIMILADO A MOTOR</b><br>Peso > 25kg Y Velocidad > 14km/h.<br>A efectos de Seguro se trata como Vehículo a Motor.<br><b>Sanción SOA:</b> 800€ (Circular) / 610€ (Titular).<br><br>ℹ️ <b>NOTA PENAL (Dictamen 2/2021):</b> No aplica Art. 384 CP ni 379 CP.<br>🏗️ <b>GRÚA:</b> No procede retirada automática. Solo si el infractor se niega a retirarlo por sus medios.",
            infractions: {
                admin: { 
                    default: { 
                        norm: "Art. 22 bis RGV", 
                        opt: "VEH.22.B-2.5A", 
                        amount: "200 €", 
                        reduced: "100 €", 
                        text: "Carecer del certificado de circulación.<br><br>⚠️ <i>REGLA BUCLE: NO formular denuncias a la vez por no tener certificado y no estar inscrito.</i>", 
                        action: "RETIRADA A CARGO DEL INFRACTOR" 
                    },
                    alt: { 
                        norm: "Art. 22 bis RGV", 
                        opt: "VEH.22.B-2.5C", 
                        amount: "80 €", 
                        reduced: "40 €", 
                        text: "No disponer o exhibir la etiqueta identificativa (M/Z) o la placa de marcaje.", 
                        action: "RETIRADA A CARGO DEL INFRACTOR" 
                    }
                },
                soa: { type: "vmp_motor", driver: { opt: "SOA.2.1.5N", amount: 800, text: "Circular el VMP sin que conste seguro de responsabilidad civil en vigor. (Indicar nº identificación en boletín)." }, owner: { opt: "SOA.2.1.5O", amount: 610, text: "Incumplir el titular la obligación de suscribir o mantener seguro (vehículo estacionado o no circulando)." } }
            }
        },
        "r_epac": { title: "BICICLETA EPAC", icon: "🚲", style: "admin", matIconType: "none", perm: "Ninguno", seg: "No", mat: "No", casco: "Recomendado", text: "✅ <b>BICI ASISTIDA</b><br>Tratamiento de bicicleta.", infractions: null },
        "r_ciclo": { title: "CICLO", icon: "🚲", style: "admin", matIconType: "none", perm: "Ninguno", seg: "No", mat: "No", casco: "Consultar Ordenanza Mun.", text: "✅ <b>BICICLETA</b><br>Tratamiento de bicicleta.", infractions: null },
        "r_juguete": { title: "JUGUETE", icon: "🛹", style: "info", matIconType: "none", perm: "No", seg: "No", mat: "No", casco: "No", text: "ℹ️ <b>USO PEATONAL</b><br>Velocidad < 6 km/h.", infractions: null },
        
        "r_l1e_a": { 
            title: "L1e-A (CICLO DE MOTOR)", icon: "🛵", style: "admin", matIconType: "ciclomotor", perm: "AM / B", seg: "Sí", mat: "SÍ (Matrícula DGT)", casco: "Sí", 
            text: "⚠️ <b>CICLO DE MOTOR (L1e-A)</b><br>Requiere Matrícula, Seguro y Casco.<br><br>ℹ️ <b>CRITERIO FISCALÍA (Dictamen 2/2021):</b> Se excluye de la Vía Penal (Arts. 379/384 CP). Procede denuncia administrativa.", 
            infractions: {
                admin: { 
                    default: { norm: "Art. 1.1 RGV", opt: "1.1.5B", amount: "500 €", reduced: "250 €", text: "Circular con un vehículo careciendo de la autorización administrativa (Permiso de Circulación) correspondiente. (Aplicable según Instr. 2019/S-149 DGT).", action: "INMOVILIZACIÓN / DEPÓSITO" },
                    alt: { norm: "Art. 10.2 LSV", opt: "5A", amount: "200 €", reduced: "100 €", text: "Carecer de placas de matrícula.", action: "INMOVILIZACIÓN / DEPÓSITO" }
                },
                soa: { type: "moped", driver: { opt: "2.1.5A", amount: 1000, text: "Circular con el vehículo reseñado careciendo del seguro obligatorio de responsabilidad civil exigido para su circulación." }, owner: { opt: "2.1.1A", amount: 650, text: "Incumplir el titular del vehículo reseñado la obligación de suscribir y mantener en vigor un contrato de seguro que cubra la responsabilidad civil derivada de su circulación." } } 
            }
        },
        "r_l1e_b": { 
            title: "L1e-B (CICLOMOTOR 2R)", icon: "🛵", style: "penal", matIconType: "ciclomotor", perm: "AM / B", seg: "Sí", mat: "SÍ (Matrícula DGT)", casco: "Sí", 
            text: "⚠️ <b>CICLOMOTOR (L1e-B)</b><br>Vehículo que excede características VMP.<br><b>⚖️ VÍA PENAL (STS 944/2025):</b><br>Al superar 25km/h o la potencia permitida, es Vehículo a Motor. Procede Art. 384 CP si carece de licencia AM, independientemente de que carezca de sillín.", 
           infractions: {
                admin: { 
                    default: { norm: "Art. 1.1 RGV", opt: "1.1.5B", amount: "500 €", reduced: "250 €", text: "Circular con un vehículo careciendo de la autorización administrativa (Permiso de Circulación) correspondiente.", action: "INMOVILIZACIÓN / DEPÓSITO" },
                    alt: { norm: "Art. 10.2 LSV", opt: "5A", amount: "200 €", reduced: "100 €", text: "Carecer de placas de matrícula.", action: "INMOVILIZACIÓN / DEPÓSITO" }
                },
                soa: { type: "moped", driver: { opt: "2.1.5A", amount: 1000, text: "Circular con el vehículo careciendo del seguro obligatorio." }, owner: { opt: "2.1.1A", amount: 650, text: "Incumplir obligación de suscribir seguro." } } 
            }
        },
        "r_l2e": { 
            title: "L2e (CICLOMOTOR 3R)", icon: "🛺", style: "penal", matIconType: "ciclomotor", perm: "AM / B", seg: "Sí", mat: "SÍ (Matrícula DGT)", casco: "Sí", 
            text: "⚠️ <b>CICLOMOTOR 3 RUEDAS</b><br>Vehículo matriculable.<br><b>⚖️ VÍA PENAL:</b><br>• 379.2 CP (Alcohol/Drogas)<br>• 384 CP (Permiso)", 
            infractions: {
                admin: { 
                    default: { norm: "Art. 1.1 RGV", opt: "1.1.5B", amount: "500 €", reduced: "250 €", text: "Carecer de autorización administrativa.", action: "INMOVILIZACIÓN / DEPÓSITO" },
                    alt: { norm: "Art. 10.2 LSV", opt: "5A", amount: "200 €", reduced: "100 €", text: "Carecer de placas de matrícula.", action: "INMOVILIZACIÓN / DEPÓSITO" }
                },
                soa: { type: "moped", driver: { opt: "2.1.5A", amount: 1000, text: "Circular sin seguro." }, owner: { opt: "2.1.1A", amount: 650, text: "Incumplir obligación de seguro." } } 
            }
        },
        "r_l6e": { 
            title: "L6e (CUADRICICLO LIGERO)", icon: "🚙", style: "penal", matIconType: "ciclomotor", perm: "AM / B", seg: "Sí", mat: "SÍ (Matrícula DGT)", casco: "Sí/Cinturón", 
            text: "⚠️ <b>CUADRICICLO LIGERO</b><br>Vehículo matriculable.<br><b>⚖️ VÍA PENAL:</b><br>• 379.2 CP (Alcohol/Drogas)<br>• 384 CP (Permiso)", 
            infractions: {
                admin: { 
                    default: { norm: "Art. 1.1 RGV", opt: "1.1.5B", amount: "500 €", reduced: "250 €", text: "Carecer de autorización administrativa.", action: "INMOVILIZACIÓN / DEPÓSITO" },
                    alt: { norm: "Art. 10.2 LSV", opt: "5A", amount: "200 €", reduced: "100 €", text: "Carecer de placas de matrícula.", action: "INMOVILIZACIÓN / DEPÓSITO" }
                },
                soa: { type: "moped", driver: { opt: "2.1.5A", amount: 1000, text: "Circular sin seguro." }, owner: { opt: "2.1.1A", amount: 650, text: "Incumplir obligación de seguro." } } 
            }
        },
        "r_l3e": { 
            title: "L3e (MOTOCICLETA)", icon: "🏍️", style: "penal", matIconType: "moto", perm: "A1 / A2 / A", seg: "Sí", mat: "SÍ (Matrícula DGT)", casco: "Sí", 
            text: "⚠️ <b>MOTOCICLETA (L3e)</b><br>Vehículo que excede características VMP.<br><b>⚖️ VÍA PENAL (STS 944/2025):</b><br>Al superar los 45km/h o potencia muy elevada es Vehículo a Motor. Procede Art. 384 CP si carece de licencia A1/A2/A.", 
            infractions: {
                admin: { 
                    default: { norm: "Art. 1.1 RGV", opt: "1.1.5B", amount: "500 €", reduced: "250 €", text: "Carecer de autorización administrativa.", action: "INMOVILIZACIÓN / DEPÓSITO" },
                    alt: { norm: "Art. 10.2 LSV", opt: "5A", amount: "200 €", reduced: "100 €", text: "Carecer de placas de matrícula.", action: "INMOVILIZACIÓN / DEPÓSITO" }
                },
                soa: { type: "moto", driver: { opt: "2.1.5B", amount: 1250, text: "Circular sin seguro." }, owner: { opt: "2.1.1B", amount: 850, text: "Incumplir obligación de seguro." } } 
            }
        },
        "r_l4e": { 
            title: "L4e (MOTO CON SIDECAR)", icon: "🏍️", style: "penal", matIconType: "moto", perm: "A1 / A2 / A", seg: "Sí", mat: "SÍ (Matrícula DGT)", casco: "Sí", 
            text: "⚠️ <b>MOTO CON SIDECAR</b><br>Vehículo matriculable.<br><b>⚖️ VÍA PENAL:</b><br>• 379.2 CP (Alcohol/Drogas)<br>• 384 CP (Permiso)", 
            infractions: {
                admin: { 
                    default: { norm: "Art. 1.1 RGV", opt: "1.1.5B", amount: "500 €", reduced: "250 €", text: "Carecer de autorización administrativa.", action: "INMOVILIZACIÓN / DEPÓSITO" },
                    alt: { norm: "Art. 10.2 LSV", opt: "5A", amount: "200 €", reduced: "100 €", text: "Carecer de placas de matrícula.", action: "INMOVILIZACIÓN / DEPÓSITO" }
                },
                soa: { type: "moto", driver: { opt: "2.1.5B", amount: 1250, text: "Circular sin seguro." }, owner: { opt: "2.1.1B", amount: 850, text: "Incumplir obligación de seguro." } } 
            }
        },
        "r_l5e": { 
            title: "L5e (TRICICLO DE MOTOR)", icon: "🛺", style: "penal", matIconType: "moto", perm: "B / A", seg: "Sí", mat: "SÍ (Matrícula DGT)", casco: "Sí", 
            text: "⚠️ <b>TRICICLO SIMÉTRICO</b><br>Vehículo matriculable.<br><b>⚖️ VÍA PENAL:</b><br>• 379.2 CP (Alcohol/Drogas)<br>• 384 CP (Permiso)", 
           infractions: {
                admin: { 
                    default: { norm: "Art. 1.1 RGV", opt: "1.1.5B", amount: "500 €", reduced: "250 €", text: "Carecer de autorización administrativa.", action: "INMOVILIZACIÓN / DEPÓSITO" },
                    alt: { norm: "Art. 10.2 LSV", opt: "5A", amount: "200 €", reduced: "100 €", text: "Carecer de placas de matrícula.", action: "INMOVILIZACIÓN / DEPÓSITO" }
                },
                soa: { type: "moto", driver: { opt: "2.1.5B", amount: 1250, text: "Circular sin seguro." }, owner: { opt: "2.1.1B", amount: 850, text: "Incumplir obligación de seguro." } } 
            }
        },
        "r_l7e": { 
            title: "L7e (CUADRICICLO PESADO)", icon: "🚜", style: "penal", matIconType: "moto", perm: "CLASE B", seg: "Sí", mat: "SÍ (Matrícula DGT)", casco: "Sí/Cinturón", 
            text: "⚠️ <b>CUADRICICLO PESADO</b><br>Vehículo matriculable.<br><b>⚖️ VÍA PENAL:</b><br>• 379.2 CP (Alcohol/Drogas)<br>• 384 CP (Permiso)", 
            infractions: {
                admin: { 
                    default: { norm: "Art. 1.1 RGV", opt: "1.1.5B", amount: "500 €", reduced: "250 €", text: "Carecer de autorización administrativa.", action: "INMOVILIZACIÓN / DEPÓSITO" },
                    alt: { norm: "Art. 10.2 LSV", opt: "5A", amount: "200 €", reduced: "100 €", text: "Carecer de placas de matrícula.", action: "INMOVILIZACIÓN / DEPÓSITO" }
                },
                soa: { type: "turismo", driver: { opt: "2.1.5C", amount: 1500, text: "Circular sin seguro." }, owner: { opt: "2.1.1C", amount: 1000, text: "Incumplir obligación de seguro." } } 
            }
        },
        "r_prohibido": { 
            title: "PROHIBIDO (NO VMP)", icon: "⛔", style: "danger", matIconType: "none", perm: "-", seg: "-", mat: "-", casco: "-", 
            text: "🚫 <b>VEHÍCULO A MOTOR CAMUFLADO / TRUCADO</b><br>Vehículo comercializado como VMP pero que supera los umbrales o ha sido modificado estructuralmente.", 
            infractions: { 
                admin: { 
                    default: { 
                        norm: "Art. 1.1 RGV", 
                        opt: "VEH.1.1.5B", 
                        amount: "500 €", 
                        reduced: "250 €", 
                        text: "Carecer de autorización administrativa para circular (vehículo inmatriculable).<br><br><i>NOTA TÁCTICA: Las condiciones técnicas en estos vehículos específicos NO son denunciables bajo normativa VMP.</i>", 
                        action: "INMOVILIZACIÓN DEFINITIVA" 
                    },
                    alt: { 
                        norm: "Art. 22 bis RGV", 
                        opt: "VEH.22.B-2.5D", 
                        amount: "500 €", 
                        reduced: "250 €", 
                        text: "Incumplimiento que afecta gravemente a la seguridad vial (Ej. Manipulación de la limitación de velocidad; modificación estructural).", 
                        action: "DEPÓSITO" 
                    }
                }, 
                soa: null 
            }
        },
        "r_prohibido_voltaje": { 
            title: "ILEGAL (VOLTAJE)", icon: "🔌", style: "danger", matIconType: "none", perm: "-", seg: "-", mat: "-", casco: "-", 
            text: "🚫 <b>VOLTAJE PELIGROSO</b><br>Excede 100VCC / 240VAC.", 
            infractions: { 
                admin: { 
                    default: { 
                        norm: "Art. 1.1 RGV", 
                        opt: "VEH.1.1.5B", 
                        amount: "500 €", 
                        reduced: "250 €", 
                        text: "Carecer de autorización administrativa para circular (vehículo inmatriculable y peligroso por alta tensión).", 
                        action: "INMOVILIZACIÓN DEFINITIVA" 
                    } 
                }, 
                soa: null 
            }
        }
    },

    steps: {
        start: { q: "¿El vehículo está motorizado?", opts: [{ t: "Sí", next: "motor_si" }, { t: "No (Bicicleta/Tracción humana)", next: "motor_no" }] },
        motor_no: { q: "¿Funciona a pedal o manivela?", opts: [{ t: "Sí", next: "pedal_si" }, { t: "No", result: "r_juguete" }] },
        pedal_si: { q: "¿Cuántas ruedas tiene?", opts: [{ t: "1 rueda", result: "r_prohibido" }, { t: "2 o más ruedas", result: "r_ciclo" }] },
        
        motor_si: { 
            q: "¿Cómo se acciona el motor principal?", 
            opts: [
                { t: "Pedaleo Asistido (EPAC)", next: "pedales_aux_si" }, 
                { t: "Acelerador/Gatillo (Independiente)", next: "acelerador_potencia" },
                { t: "Autoequilibrado (Segway o Hoverboard)", next: "autoeq_potencia" }
            ] 
        },

        // --- RAMA 1: ACELERADOR INDEPENDIENTE (Patinetes / Scooters) ---
        acelerador_potencia: {
            q: "¿Cuál es la potencia nominal del motor (W)?",
            opts: [
                { t: "Hasta 1000 W", next: "vel_acelerador_legal" },
                { t: "1001 W - 2500 W", next: "check_velocidad_penal" },
                { t: "Más de 2500 W", next: "check_velocidad_penal" }
            ]
        },
        vel_acelerador_legal: {
            q: "¿Cuál es la velocidad máxima por construcción?",
            opts: [
                { t: "Hasta 6 km/h", result: "r_juguete" },
                { t: "De 6 a 25 km/h", next: "check_sillin_vmp" },
                { t: "Más de 25 km/h", next: "check_velocidad_penal" } 
            ]
        },

        // --- RAMA 2: AUTOEQUILIBRADOS ---
        autoeq_potencia: {
            q: "Autoequilibrado. ¿Potencia nominal del motor (W)?",
            opts: [
                { t: "Hasta 2500 W", next: "vel_autoeq_legal" }, 
                { t: "Más de 2500 W", next: "check_velocidad_penal" }
            ]
        },
        vel_autoeq_legal: {
            q: "¿Cuál es su velocidad máxima por construcción?",
            opts: [
                { t: "Hasta 6 km/h", result: "r_juguete" },
                { t: "De 6 a 25 km/h", next: "check_sillin_autoeq" }, 
                { t: "Más de 25 km/h", next: "check_velocidad_penal" }
            ]
        },
        check_sillin_autoeq: {
            q: "¿Tiene sillín el monociclo/autoequilibrado?",
            opts: [
                { t: "Sí", next: "altura_sillin_autoeq" },
                { t: "No", next: "check_baterias" }
            ]
        },
        altura_sillin_autoeq: {
            q: "⚠️ En autoequilibrados. ¿El sillín en su posición baja está a MÁS de 500 mm (50 cm) del suelo?",
            opts: [
                { t: "Sí (Más de 500 mm)", next: "check_baterias" },
                { t: "No (Menos de 500 mm)", result: "r_prohibido" } 
            ]
        },

        // --- FILTRO PENAL CENTRAL ---
        check_velocidad_penal: {
            q: "⛔ Excede límites VMP. ¿Velocidad máxima que alcanza?",
            opts: [
                { t: "Hasta 45 km/h", result: "r_l1e_b" }, 
                { t: "Más de 45 km/h", result: "r_l3e" }  
            ]
        },

        // --- FILTRO ADMINISTRATIVO: SILLÍN EN VMP LEGALES ---
        check_sillin_vmp: {
            q: "¿Tiene sillín el vehículo?",
            opts: [
                { t: "Sí", next: "vmp_sillin_altura" },
                { t: "No", next: "check_baterias" }
            ]
        },
        vmp_sillin_altura: {
            q: "¿Cuál es la altura del sillín (Punto R)?",
            opts: [
                { t: "Menos de 54 cm", result: "r_prohibido" }, 
                { t: "54 cm o más", result: "r_l1e_b" } 
            ]
        },

        // --- RAMA 3: PEDALEO ASISTIDO (Bicicletas) ---
        pedales_aux_si: { 
            q: "¿Cuál es la potencia del motor (W)?", 
            opts: [
                { t: "Hasta 250 W", next: "potencia_250" }, 
                { t: "Entre 250 W y 1000 W", next: "potencia_1000" }, 
                { t: "Más de 1000 W", next: "check_velocidad_penal" }
            ] 
        },
        potencia_250: { q: "¿El motor se detiene al superar 25 km/h?", opts: [{ t: "Sí", result: "r_epac" }, { t: "No (Sigue asistiendo)", result: "r_l1e_a" }] },
        potencia_1000: { q: "¿Hasta qué velocidad auxilia el motor?", opts: [{ t: "Entre 25 y 45 km/h", result: "r_l1e_a" }, { t: "Más de 45 km/h", result: "r_l3e" }] },

        // --- CHECKS TÉCNICOS FINALES PARA VMP ---
        check_baterias: { 
            q: "¿Qué voltaje indican las características técnicas?", 
            opts: [
                { t: "Hasta 100 VCC / 240 VCA", next: "check_peso" }, 
                { t: "Superior (Alta Tensión)", result: "r_prohibido_voltaje" }
            ] 
        },
        check_peso: {
            q: "¿Cuál es el PESO del vehículo (Masa en orden de marcha)?",
            opts: [
                { t: "Menos de 25 kg", result: "r_vmp_vpl" }, 
                { t: "25 kg o más", next: "check_velocidad_fina" } 
            ]
        },
        check_velocidad_fina: {
            q: "El vehículo pesa ≥ 25kg. ¿Cuál es su velocidad máxima?",
            opts: [
                { t: "Entre 6 y 14 km/h", result: "r_vmp_vpl" }, 
                { t: "Más de 14 km/h (hasta 25)", result: "r_vmp_motor" } 
            ]
        }
    },

    historyStack: [],
    dom: { qArea: document.getElementById('question-area'), modal: document.getElementById('result-modal') },

    // --- TU BOTÓN DOBLE (👈) Y REINICIO (🔄) INTACTOS ---
    renderStep: function(key) {
        const step = this.steps[key];
        const d = this.dom;
        const canGoBack = this.historyStack.length > 0;
        
        let html = `<div class="question-header">
                        <h2 class="question-title">${step.q}</h2>
                        <div style="display:flex; gap:10px;">
                            ${canGoBack ? `<button class="help-btn-icon" onclick="app.resetApp()" style="background:var(--police-light); color:var(--accent); border:none;" title="Empezar de cero">🔄</button>` : ''}
                            <button class="help-btn-icon" onclick="document.getElementById('help-modal').style.display='flex'" title="Ayuda">?</button>
                        </div>
                    </div><div class="options-grid">`;
        
        step.opts.forEach(opt => {
            const action = opt.result ? `app.showResult('${opt.result}')` : `app.nextStep('${key}', '${opt.next}')`;
            
            if (canGoBack) {
                // Genera un "Botón Doble": Izquierda retrocede, Derecha avanza
                html += `
                <div style="display: flex; width: 100%; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 5px rgba(0,0,0,0.1);">
                    <button onclick="app.prevStep()" style="background-color: var(--police-light); color: var(--accent); border: none; padding: 0 18px; font-size: 1.4rem; cursor: pointer; border-right: 1px solid rgba(255,255,255,0.2); transition: 0.2s;" title="Volver a la pregunta anterior">👈</button>
                    <button class="option-btn" style="flex-grow: 1; border-radius: 0; box-shadow: none;" onclick="${action}">${opt.t} <span>👉</span></button>
                </div>`;
            } else {
                // En la primera pregunta solo hay avance
                html += `<button class="option-btn" onclick="${action}">${opt.t} <span>👉</span></button>`;
            }
        });
        
        html += `</div>`;
        d.qArea.innerHTML = html;
    },

    nextStep: function(currentKey, nextKey) { this.historyStack.push(currentKey); this.renderStep(nextKey); },
    prevStep: function() { if (this.historyStack.length > 0) { const prevKey = this.historyStack.pop(); this.renderStep(prevKey); } },

    showResult: function(resultKey) {
        const data = this.resultsDB[resultKey];
        const m = this.dom.modal;
        const strip = document.getElementById('modal-header-strip');
        const box = document.getElementById('res-legal-box');
        const btnSoa = document.getElementById('btn-soa');

        // --- TU MAGIA PARA AUTOEQUILIBRADOS ---
        const isAutoeq = this.historyStack.includes('autoeq_potencia') || this.historyStack.includes('vel_autoeq_legal') || this.historyStack.includes('check_sillin_autoeq') || this.historyStack.includes('altura_sillin_autoeq');
        const isVMP = (resultKey === 'r_vmp_vpl' || resultKey === 'r_vmp_motor');

        strip.className = "modal-header-strip";
        box.className = "legal-box";
        if (data.style === "penal" || data.style === "danger") { strip.classList.add("header-danger"); box.classList.add("box-penal"); }
        else if (data.style === "admin") { strip.classList.add("header-success"); box.classList.add("box-admin"); }
        else { strip.classList.add("header-warning"); box.classList.add("box-info"); }

        // Si es autoequilibrado, cambiamos el emoji principal por la imagen
        if (isAutoeq && isVMP) {
            document.getElementById('res-icon').innerHTML = '<img src="logoautoequilibrado.png" style="height: 80px; width: auto; object-fit: contain;">';
            document.getElementById('res-title').innerText = data.title + " (AUTOEQ.)";
        } else {
            document.getElementById('res-icon').innerHTML = data.icon; 
            document.getElementById('res-title').innerText = data.title;
        }
        
        document.getElementById('res-permiso').innerText = data.perm;
        document.getElementById('res-seguro').innerText = data.seg;
        document.getElementById('res-matricula-text').innerText = data.mat; 
        document.getElementById('res-casco').innerText = data.casco;
        box.innerHTML = data.text;

        const plateContainer = document.getElementById('res-plate-container');
        plateContainer.innerHTML = ''; 

        if (data.matIconType && data.matIconType !== 'none') {
            let iconSrc = ''; let iconClass = '';
            if (data.matIconType === 'ciclomotor') { iconSrc = ICON_CILOMOTOR; iconClass = 'plate-ciclomotor'; } 
            else if (data.matIconType === 'moto') { iconSrc = ICON_MOTO; iconClass = 'plate-moto'; } 
            else if (data.matIconType === 'vmp') { 
                iconSrc = (isAutoeq && isVMP) ? "VMPPLACA.png" : ICON_VMP; 
                iconClass = 'plate-vmp'; 
            }
            if (iconSrc) { plateContainer.innerHTML = `<img src="${iconSrc}" alt="Vehículo" class="${iconClass}" onerror="this.style.display='none'">`; }
        }

        this.currentInfractionData = data.infractions;
        if (data.infractions && (data.infractions.admin || data.infractions.soa)) { btnSoa.style.display = 'block'; } else { btnSoa.style.display = 'none'; }
        m.style.display = 'flex';
    },

    showInfractions: function() {
        if(!this.currentInfractionData) return;
        const inf = this.currentInfractionData;
        
        const cardAdmin = document.getElementById('inf-card-admin');
        const adminToggleWrapper = document.getElementById('admin-toggle-wrapper');
        const btnOptNoReg = document.getElementById('btn-opt-noreg');
        const btnOptNoPlate = document.getElementById('btn-opt-noplate');

        if(inf.admin) {
            cardAdmin.style.display = 'block';
            this.isAdminSwitched = false;
            btnOptNoReg.classList.add('active');
            btnOptNoPlate.classList.remove('active');

            if (inf.admin.alt) {
                adminToggleWrapper.style.display = 'flex';
                this.setAdminContent(inf.admin.default);
            } else {
                adminToggleWrapper.style.display = 'none';
                this.setAdminContent(inf.admin.default); 
            }
        } else { cardAdmin.style.display = 'none'; }

        const cardSoa = document.getElementById('inf-card-soa');
        const infTabs = document.getElementById('inf-tabs');
        
        if(inf.soa) {
            cardSoa.style.display = 'block';
            if (inf.soa.type === 'vpl') {
                infTabs.style.display = 'none'; this.switchInfractionMode('driver'); 
            } else {
                infTabs.style.display = 'flex'; this.switchInfractionMode('driver');
            }
        } else { cardSoa.style.display = 'none'; infTabs.style.display = 'none'; }

        document.getElementById('infraction-modal').style.display = 'flex';
    },

    setAdminContent: function(data) {
        document.getElementById('inf-admin-norm').innerText = data.norm;
        document.getElementById('inf-admin-opt').innerText = data.opt;
        document.getElementById('inf-admin-amount').innerText = data.amount;
        document.getElementById('inf-admin-reduced').innerText = data.reduced || '-';
        // innerHTML es necesario para procesar los estilos en línea (rojo) y los saltos de línea (br)
        document.getElementById('inf-admin-text').innerHTML = data.text;
        document.getElementById('inf-admin-action').innerText = "MEDIDA: " + data.action.replace(' 🏗️', '');
    },

    setAdminMode: function(mode) {
        if(!this.currentInfractionData || !this.currentInfractionData.admin) return;
        const btnNoReg = document.getElementById('btn-opt-noreg');
        const btnNoPlate = document.getElementById('btn-opt-noplate');

        if(mode === 'alt') {
            this.setAdminContent(this.currentInfractionData.admin.alt);
            btnNoReg.classList.remove('active'); btnNoPlate.classList.add('active');
        } else {
            this.setAdminContent(this.currentInfractionData.admin.default);
            btnNoReg.classList.add('active'); btnNoPlate.classList.remove('active');
        }
    },

    switchInfractionMode: function(mode) {
        this.currentMode = mode;
        if(!this.currentInfractionData || !this.currentInfractionData.soa) return;
        if (this.currentInfractionData.soa.type === 'vpl' && mode === 'owner') return;

        const data = this.currentInfractionData.soa[mode];
        const btns = document.querySelectorAll('.inf-toggle-btn');
        btns.forEach(btn => btn.classList.remove('active'));
        if(mode === 'driver') btns[0].classList.add('active'); else btns[1].classList.add('active');
        
        document.getElementById('inf-soa-opt').innerText = data.opt;
        document.getElementById('inf-soa-amount').innerText = data.amount + " €";
        document.getElementById('inf-soa-reduced').innerText = (data.amount / 2) + " €";
        document.getElementById('inf-soa-text').innerText = data.text;
    },

    toggleHelpSection: function(id) { const el = document.getElementById('help-' + id); el.style.display = (el.style.display === 'block') ? 'none' : 'block'; },
    closeModal: function() { this.dom.modal.style.display = 'none'; },
    resetApp: function() { this.closeModal(); this.historyStack = []; this.renderStep('start'); }
};