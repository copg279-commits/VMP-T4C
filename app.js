const LOGO_JUDICIAL = "POLICIA.png";
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
            text: "✅ <b>VPL (Vehículo Personal Ligero)</b><br>Peso < 25kg ó (Peso > 25kg y Vel < 14km/h).<br>No se considera vehículo a motor, pero requiere Seguro.<br><b>Sanción SOA:</b> Solo por circular (350€).<br><br>ℹ️ <b>NOTA PENAL:</b> No aplica Art. 384 CP salvo que el vehículo esté manipulado/trucado para superar los 25km/h o 1000W.",
            infractions: {
                admin: { 
                    default: { norm: "Art. 76.o LSV (Ref. 22bis RGV)", opt: "Genérica", amount: "200 €", reduced: "100 €", text: "Circular con el vehículo reseñado incumpliendo las normas sobre el certificado para la circulación y su identificación. (Aplicable según Instr. 16/V-124 DGT).", action: "DEPÓSITO (ORD. MUN.)" },
                    alt: { norm: "Art. 10.2 LSV (RDL 6/2015)", opt: "5A", amount: "200 €", reduced: "100 €", text: "Circular con el vehículo reseñado careciendo de las placas de matrícula (o identificación VMP) estando inscrito.", action: "DEPÓSITO (ORD. MUN.)" }
                },
                soa: { type: "vpl", driver: { opt: "2.1.5P", amount: 350, text: "Circular con el vehículo reseñado careciendo del seguro obligatorio de responsabilidad civil exigido para su circulación." }, owner: null }
            }
        },
        "r_vmp_motor": {
            title: "VMP (>25KG Y >14KM/H)", icon: "🛴", style: "admin", matIconType: "vmp",
            perm: "Ninguno", seg: "OBLIGATORIO (MOTOR)", mat: "Registro DGT (Chapa/QR)", casco: "Consultar Ordenanza Mun.",
            text: "⚠️ <b>VMP ASIMILADO A MOTOR</b><br>Peso > 25kg Y Velocidad > 14km/h.<br>A efectos de Seguro se trata como Vehículo a Motor.<br><b>Sanción SOA:</b> 800€ (Circular) / 610€ (Titular).<br><br>ℹ️ <b>NOTA PENAL (Dictamen 2/2021):</b> No aplica Art. 384 CP ni 379 CP (Alcoholemia Penal) salvo que cause lesiones/homicidio imprudente.",
            infractions: {
                admin: { 
                    default: { norm: "Art. 76.o LSV (Ref. 22bis RGV)", opt: "Genérica", amount: "200 €", reduced: "100 €", text: "Circular con el vehículo reseñado incumpliendo las normas sobre el certificado para la circulación y su identificación. (Aplicable según Instr. 16/V-124 DGT).", action: "DEPÓSITO (ORD. MUN.)" },
                    alt: { norm: "Art. 10.2 LSV (RDL 6/2015)", opt: "5A", amount: "200 €", reduced: "100 €", text: "Circular con el vehículo reseñado careciendo de las placas de matrícula (o identificación VMP) estando inscrito.", action: "DEPÓSITO (ORD. MUN.)" }
                },
                soa: { type: "vmp_motor", driver: { opt: "2.1.5N", amount: 800, text: "Circular con el vehículo reseñado careciendo del seguro obligatorio de responsabilidad civil exigido para su circulación." }, owner: { opt: "2.1.5O", amount: 610, text: "Incumplir el titular del vehículo reseñado la obligación de suscribir y mantener en vigor un contrato de seguro que cubra la responsabilidad civil derivada de su circulación." } }
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
                    default: { norm: "Art. 1.1 RGV", opt: "1.1.5B", amount: "500 €", reduced: "250 €", text: "Circular con un vehículo careciendo de la autorización administrativa (Permiso de Circulación) correspondiente. (Aplicable según Instr. 2019/S-149 DGT al perder la condición de VMP).", action: "INMOVILIZACIÓN / DEPÓSITO" },
                    alt: { norm: "Art. 10.2 LSV", opt: "5A", amount: "200 €", reduced: "100 €", text: "Carecer de placas de matrícula (Vehículo SÍ registrado pero sin placa física).", action: "INMOVILIZACIÓN / DEPÓSITO" }
                },
                soa: { type: "moped", driver: { opt: "2.1.5A", amount: 1000, text: "Circular con el vehículo reseñado careciendo del seguro obligatorio de responsabilidad civil exigido para su circulación." }, owner: { opt: "2.1.1A", amount: 650, text: "Incumplir el titular del vehículo reseñado la obligación de suscribir y mantener en vigor un contrato de seguro que cubra la responsabilidad civil derivada de su circulación." } } 
            }
        },
        "r_l1e_b": { 
            title: "L1e-B (CICLOMOTOR 2R)", icon: "🛵", style: "penal", matIconType: "ciclomotor", perm: "AM / B", seg: "Sí", mat: "SÍ (Matrícula DGT)", casco: "Sí", 
            text: "⚠️ <b>CICLOMOTOR (L1e-B)</b><br>Vehículo matriculable.<br><b>⚖️ VÍA PENAL:</b><br>• 379.2 CP (Alcohol/Drogas)<br>• 384 CP (Permiso)", 
           infractions: {
                admin: { 
                    default: { norm: "Art. 1.1 RGV", opt: "1.1.5B", amount: "500 €", reduced: "250 €", text: "Circular con un vehículo careciendo de la autorización administrativa (Permiso de Circulación) correspondiente. (Aplicable según Instr. 2019/S-149 DGT al perder la condición de VMP).", action: "INMOVILIZACIÓN / DEPÓSITO" },
                    alt: { norm: "Art. 10.2 LSV", opt: "5A", amount: "200 €", reduced: "100 €", text: "Carecer de placas de matrícula (Vehículo SÍ registrado pero sin placa física).", action: "INMOVILIZACIÓN / DEPÓSITO" }
                },
                soa: { type: "moped", driver: { opt: "2.1.5A", amount: 1000, text: "Circular con el vehículo reseñado careciendo del seguro obligatorio de responsabilidad civil exigido para su circulación." }, owner: { opt: "2.1.1A", amount: 650, text: "Incumplir el titular del vehículo reseñado la obligación de suscribir y mantener en vigor un contrato de seguro que cubra la responsabilidad civil derivada de su circulación." } } 
            }
        },
        "r_l2e": { 
            title: "L2e (CICLOMOTOR 3R)", icon: "🛺", style: "penal", matIconType: "ciclomotor", perm: "AM / B", seg: "Sí", mat: "SÍ (Matrícula DGT)", casco: "Sí", 
            text: "⚠️ <b>CICLOMOTOR 3 RUEDAS</b><br>Vehículo matriculable.<br><b>⚖️ VÍA PENAL:</b><br>• 379.2 CP (Alcohol/Drogas)<br>• 384 CP (Permiso)", 
            infractions: {
                admin: { 
                    default: { norm: "Art. 1.1 RGV", opt: "1.1.5B", amount: "500 €", reduced: "250 €", text: "Circular con un vehículo careciendo de la autorización administrativa (Permiso de Circulación) correspondiente. (Aplicable según Instr. 2019/S-149 DGT al perder la condición de VMP).", action: "INMOVILIZACIÓN / DEPÓSITO" },
                    alt: { norm: "Art. 10.2 LSV", opt: "5A", amount: "200 €", reduced: "100 €", text: "Carecer de placas de matrícula (Vehículo SÍ registrado pero sin placa física).", action: "INMOVILIZACIÓN / DEPÓSITO" }
                },
                soa: { type: "moped", driver: { opt: "2.1.5A", amount: 1000, text: "Circular con el vehículo reseñado careciendo del seguro obligatorio de responsabilidad civil exigido para su circulación." }, owner: { opt: "2.1.1A", amount: 650, text: "Incumplir el titular del vehículo reseñado la obligación de suscribir y mantener en vigor un contrato de seguro que cubra la responsabilidad civil derivada de su circulación." } } 
            }
        },
        "r_l6e": { 
            title: "L6e (CUADRICICLO LIGERO)", icon: "🚙", style: "penal", matIconType: "ciclomotor", perm: "AM / B", seg: "Sí", mat: "SÍ (Matrícula DGT)", casco: "Sí/Cinturón", 
            text: "⚠️ <b>CUADRICICLO LIGERO</b><br>Vehículo matriculable.<br><b>⚖️ VÍA PENAL:</b><br>• 379.2 CP (Alcohol/Drogas)<br>• 384 CP (Permiso)", 
            infractions: {
                admin: { 
                    default: { norm: "Art. 1.1 RGV", opt: "1.1.5B", amount: "500 €", reduced: "250 €", text: "Circular con un vehículo careciendo de la autorización administrativa (Permiso de Circulación) correspondiente. (Aplicable según Instr. 2019/S-149 DGT al perder la condición de VMP).", action: "INMOVILIZACIÓN / DEPÓSITO" },
                    alt: { norm: "Art. 10.2 LSV", opt: "5A", amount: "200 €", reduced: "100 €", text: "Carecer de placas de matrícula (Vehículo SÍ registrado pero sin placa física).", action: "INMOVILIZACIÓN / DEPÓSITO" }
                },
                soa: { type: "moped", driver: { opt: "2.1.5A", amount: 1000, text: "Circular con el vehículo reseñado careciendo del seguro obligatorio de responsabilidad civil exigido para su circulación." }, owner: { opt: "2.1.1A", amount: 650, text: "Incumplir el titular del vehículo reseñado la obligación de suscribir y mantener en vigor un contrato de seguro que cubra la responsabilidad civil derivada de su circulación." } } 
            }
        },
        "r_l3e": { 
            title: "L3e (MOTOCICLETA)", icon: "🏍️", style: "penal", matIconType: "moto", perm: "A1 / A2 / A", seg: "Sí", mat: "SÍ (Matrícula DGT)", casco: "Sí", 
            text: "⚠️ <b>MOTOCICLETA (L3e)</b><br>Vehículo matriculable.<br><b>⚖️ VÍA PENAL:</b><br>• 379.2 CP (Alcohol/Drogas)<br>• 384 CP (Permiso)", 
            infractions: {
                admin: { 
                    default: { norm: "Art. 1.1 RGV", opt: "1.1.5B", amount: "500 €", reduced: "250 €", text: "Circular con un vehículo careciendo de la autorización administrativa (Permiso de Circulación) correspondiente. (Aplicable según Instr. 2019/S-149 DGT al perder la condición de VMP).", action: "INMOVILIZACIÓN / DEPÓSITO" },
                    alt: { norm: "Art. 10.2 LSV", opt: "5A", amount: "200 €", reduced: "100 €", text: "Carecer de placas de matrícula.", action: "INMOVILIZACIÓN / DEPÓSITO" }
                },
                soa: { type: "moto", driver: { opt: "2.1.5B", amount: 1250, text: "Circular con el vehículo reseñado careciendo del seguro obligatorio de responsabilidad civil exigido para su circulación." }, owner: { opt: "2.1.1B", amount: 850, text: "Incumplir el titular del vehículo reseñado la obligación de suscribir y mantener en vigor un contrato de seguro que cubra la responsabilidad civil derivada de su circulación." } } 
            }
        },
        "r_l4e": { 
            title: "L4e (MOTO CON SIDECAR)", icon: "🏍️", style: "penal", matIconType: "moto", perm: "A1 / A2 / A", seg: "Sí", mat: "SÍ (Matrícula DGT)", casco: "Sí", 
            text: "⚠️ <b>MOTO CON SIDECAR</b><br>Vehículo matriculable.<br><b>⚖️ VÍA PENAL:</b><br>• 379.2 CP (Alcohol/Drogas)<br>• 384 CP (Permiso)", 
            infractions: {
                admin: { 
                    default: { norm: "Art. 1.1 RGV", opt: "1.1.5B", amount: "500 €", reduced: "250 €", text: "Circular con un vehículo careciendo de la autorización administrativa (Permiso de Circulación) correspondiente. (Aplicable según Instr. 2019/S-149 DGT al perder la condición de VMP).", action: "INMOVILIZACIÓN / DEPÓSITO" },
                    alt: { norm: "Art. 10.2 LSV", opt: "5A", amount: "200 €", reduced: "100 €", text: "Carecer de placas de matrícula.", action: "INMOVILIZACIÓN / DEPÓSITO" }
                },
                soa: { type: "moto", driver: { opt: "2.1.5B", amount: 1250, text: "Circular con el vehículo reseñado careciendo del seguro obligatorio de responsabilidad civil exigido para su circulación." }, owner: { opt: "2.1.1B", amount: 850, text: "Incumplir el titular del vehículo reseñado la obligación de suscribir y mantener en vigor un contrato de seguro que cubra la responsabilidad civil derivada de su circulación." } } 
            }
        },
        "r_l5e": { 
            title: "L5e (TRICICLO DE MOTOR)", icon: "🛺", style: "penal", matIconType: "moto", perm: "B / A", seg: "Sí", mat: "SÍ (Matrícula DGT)", casco: "Sí", 
            text: "⚠️ <b>TRICICLO SIMÉTRICO</b><br>Vehículo matriculable.<br><b>⚖️ VÍA PENAL:</b><br>• 379.2 CP (Alcohol/Drogas)<br>• 384 CP (Permiso)", 
           infractions: {
                admin: { 
                    default: { norm: "Art. 1.1 RGV", opt: "1.1.5B", amount: "500 €", reduced: "250 €", text: "Circular con un vehículo careciendo de la autorización administrativa (Permiso de Circulación) correspondiente. (Aplicable según Instr. 2019/S-149 DGT al perder la condición de VMP).", action: "INMOVILIZACIÓN / DEPÓSITO" },
                    alt: { norm: "Art. 10.2 LSV", opt: "5A", amount: "200 €", reduced: "100 €", text: "Carecer de placas de matrícula.", action: "INMOVILIZACIÓN / DEPÓSITO" }
                },
                soa: { type: "moto", driver: { opt: "2.1.5B", amount: 1250, text: "Circular con el vehículo reseñado careciendo del seguro obligatorio de responsabilidad civil exigido para su circulación." }, owner: { opt: "2.1.1B", amount: 850, text: "Incumplir el titular del vehículo reseñado la obligación de suscribir y mantener en vigor un contrato de seguro que cubra la responsabilidad civil derivada de su circulación." } } 
            }
        },
        "r_l7e": { 
            title: "L7e (CUADRICICLO PESADO)", icon: "🚜", style: "penal", matIconType: "moto", perm: "CLASE B", seg: "Sí", mat: "SÍ (Matrícula DGT)", casco: "Sí/Cinturón", 
            text: "⚠️ <b>CUADRICICLO PESADO</b><br>Vehículo matriculable.<br><b>⚖️ VÍA PENAL:</b><br>• 379.2 CP (Alcohol/Drogas)<br>• 384 CP (Permiso)", 
            infractions: {
                admin: { 
                    default: { norm: "Art. 1.1 RGV", opt: "1.1.5B", amount: "500 €", reduced: "250 €", text: "Circular con un vehículo careciendo de la autorización administrativa (Permiso de Circulación) correspondiente. (Aplicable según Instr. 2019/S-149 DGT al perder la condición de VMP).", action: "INMOVILIZACIÓN / DEPÓSITO" },
                    alt: { norm: "Art. 10.2 LSV", opt: "5A", amount: "200 €", reduced: "100 €", text: "Carecer de placas de matrícula.", action: "INMOVILIZACIÓN / DEPÓSITO" }
                },
                soa: { type: "turismo", driver: { opt: "2.1.5C", amount: 1500, text: "Circular con el vehículo reseñado careciendo del seguro obligatorio de responsabilidad civil exigido para su circulación." }, owner: { opt: "2.1.1C", amount: 1000, text: "Incumplir el titular del vehículo reseñado la obligación de suscribir y mantener en vigor un contrato de seguro que cubra la responsabilidad civil derivada de su circulación." } } 
            }
        },
        "r_prohibido": { 
            title: "PROHIBIDO", icon: "⛔", style: "danger", matIconType: "none", perm: "-", seg: "-", mat: "-", casco: "-", 
            text: "🚫 <b>NO APTO</b><br>No cumple normativa. Denuncia y retirada.", 
            infractions: { 
                admin: { 
                    default: { 
                        norm: "Art. 1.1 RGV", 
                        opt: "1.1.5B", 
                        amount: "500 €", 
                        reduced: "250 €", 
                        text: "Circular con un vehículo careciendo de la autorización administrativa (Permiso de Circulación) correspondiente. (Aplicable según Instr. 2019/S-149 DGT al no reunir requisitos VMP ni poder homologarse).", 
                        action: "INMOVILIZACIÓN DEFINITIVA" 
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
                        opt: "1.1.5B", 
                        amount: "500 €", 
                        reduced: "250 €", 
                        text: "Circular con un vehículo careciendo de la autorización administrativa (Permiso de Circulación) correspondiente. (Aplicable según Instr. 2019/S-149 DGT por exceder los límites de voltaje y perder la condición de VMP).", 
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
                { t: "Pedaleo Asistido", next: "pedales_aux_si" }, 
                { t: "Acelerador/Gatillo (Independiente)", next: "pedales_aux_no" },
                { t: "Autoequilibrado (Segway o Hoverboard)", next: "vel_autoeq" }
            ] 
        },
        
        vel_autoeq: { 
            q: "Vehículo Autoequilibrado. ¿Cuál es su velocidad máxima por construcción?", 
            opts: [
                { t: "Hasta 6 km/h", result: "r_juguete" }, 
                { t: "De 6 a 25 km/h", next: "check_baterias" }, 
                { t: "Más de 25 km/h", result: "r_prohibido" }
            ] 
        },
        pedales_aux_si: { q: "¿Cuál es la potencia del motor?", opts: [{ t: "Hasta 250 W", next: "potencia_250" }, { t: "Entre 250 W y 1000 W", next: "potencia_1000" }, { t: "Más de 1000 W", next: "check_velocidad_1000w" }] },
        check_velocidad_1000w: { q: "Motor > 1000W. ¿Cuál es la velocidad máxima por construcción?", opts: [{ t: "Hasta 45 km/h", result: "r_l1e_b" }, { t: "Más de 45 km/h", result: "r_l3e" }] },

        potencia_250: { q: "¿El motor se detiene al superar 25 km/h?", opts: [{ t: "Sí", result: "r_epac" }, { t: "No (Sigue asistiendo)", result: "r_l1e_a" }] },
        potencia_1000: { q: "¿Hasta qué velocidad auxilia el motor?", opts: [{ t: "Entre 25 y 45 km/h", result: "r_l1e_a" }, { t: "Más de 45 km/h", result: "r_l3e" }] },
        pedales_aux_no: { q: "¿Cuál es la velocidad máxima por construcción?", opts: [{ t: "Hasta 6 km/h", result: "r_juguete" }, { t: "De 6 a 25 km/h", next: "vel_6_25" }, { t: "De 25 a 45 km/h", next: "vel_hasta_45" }, { t: "Más de 45 km/h", next: "vel_mas_45" }] },
        
        vel_6_25: { q: "Velocidad 6-25 km/h. ¿Tiene sillín?", opts: [{ t: "Sí", next: "con_sillin_6_25" }, { t: "No", next: "check_baterias" }] },
        con_sillin_6_25: { q: "¿Es un vehículo autoequilibrado (ej. Segway)?", opts: [{ t: "Sí", next: "check_baterias" }, { t: "No", next: "check_altura_sillin_vmp" }] }, 
        
        check_altura_sillin_vmp: { 
            q: "¿Cuál es la altura del sillín (Punto R)?", 
            opts: [
                { t: "Menos de 40 cm", result: "r_prohibido" },
                { t: "Entre 40 y 53 cm", next: "ruedas_40_53_vmp" },
                { t: "54 cm o más", next: "ruedas_54_vmp" }
            ] 
        },
        ruedas_40_53_vmp: { q: "Altura 40-53cm. ¿Cuántas ruedas tiene?", opts: [{ t: "2 Ruedas", result: "r_prohibido" }, { t: "3 Ruedas", result: "r_l2e" }, { t: "4 Ruedas", result: "r_l6e" }] },
        ruedas_54_vmp: { q: "Altura ≥54cm. ¿Cuántas ruedas tiene?", opts: [{ t: "2 Ruedas", result: "r_l1e_b" }, { t: "3 Ruedas", result: "r_l2e" }, { t: "4 Ruedas", result: "r_l6e" }] },

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
        },

        vel_hasta_45: { q: "Velocidad 25-45 km/h. ¿Tiene sillín?", opts: [{ t: "Sí", next: "check_potencia_45" }, { t: "No", result: "r_prohibido" }] },
        check_potencia_45: { q: "Verificación de Potencia / Cilindrada:", opts: [{ t: "≤ 50cc o ≤ 4000 W", next: "check_altura_sillin_baja_potencia" }, { t: "≤ 50cc o 4001 W - 6000 W", next: "ruedas_6000w" }, { t: "> 50cc o > 6000 W", next: "ruedas_heavy" }] },
        check_altura_sillin_baja_potencia: { 
            q: "¿Cuál es la altura del sillín (Punto R)?", 
            opts: [
                { t: "Menos de 40 cm", result: "r_prohibido" },
                { t: "Entre 40 y 53 cm", next: "ruedas_baja_potencia_40_53" },
                { t: "54 cm o más", next: "ruedas_baja_potencia_54" }
            ] 
        },
        ruedas_baja_potencia_40_53: { q: "Altura 40-53cm. ¿Cuántas ruedas tiene?", opts: [{ t: "2 Ruedas", result: "r_prohibido" }, { t: "3 Ruedas", result: "r_l2e" }, { t: "4 Ruedas", result: "r_l6e" }] },
        ruedas_baja_potencia_54: { q: "Altura ≥54cm. ¿Cuántas ruedas tiene?", opts: [{ t: "2 Ruedas", result: "r_l1e_b" }, { t: "3 Ruedas", result: "r_l2e" }, { t: "4 Ruedas", result: "r_l6e" }] },
        ruedas_6000w: { q: "Potencia Media (4-6kW). ¿Cuántas ruedas tiene?", opts: [{ t: "2 Ruedas", result: "r_l3e" }, { t: "3 Ruedas", next: "check_tipo_3_ruedas" }, { t: "4 Ruedas", result: "r_l6e" }] },
        ruedas_heavy: { q: "Potencia Alta (>6kW). ¿Cuántas ruedas tiene?", opts: [{ t: "2 Ruedas", result: "r_l3e" }, { t: "3 Ruedas", next: "check_tipo_3_ruedas" }, { t: "4 Ruedas", result: "r_l7e" }] },
        vel_mas_45: { q: "Velocidad > 45 km/h. ¿Tiene sillín?", opts: [{ t: "Sí", next: "ruedas_mas_45" }, { t: "No", result: "r_prohibido" }] },
        ruedas_mas_45: { q: "Alta Velocidad. ¿Cuántas ruedas tiene?", opts: [{ t: "2 Ruedas", result: "r_l3e" }, { t: "3 Ruedas", next: "check_tipo_3_ruedas" }, { t: "4 Ruedas", result: "r_l7e" }] },
        check_tipo_3_ruedas: { q: "Vehículo 3 ruedas. ¿Disposición de las ruedas?", opts: [{ t: "Simétricas (Triciclo en eje)", result: "r_l5e" }, { t: "Asimétricas (Moto con sidecar)", result: "r_l4e" }] }
    },

    historyStack: [],
    dom: { qArea: document.getElementById('question-area'), modal: document.getElementById('result-modal') },

    // --- MAGIA PURA: BOTÓN UNIDO CON LA MANO IZQUIERDA Y REINICIO ARRIBA ---
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

        // --- MAGIA PARA AUTOEQUILIBRADOS ---
        // Comprobamos si en el historial de pasos está el de "vel_autoeq"
        const isAutoeq = this.historyStack.includes('vel_autoeq');
        const isVMP = (resultKey === 'r_vmp_vpl' || resultKey === 'r_vmp_motor');

        strip.className = "modal-header-strip";
        box.className = "legal-box";
        if (data.style === "penal" || data.style === "danger") { strip.classList.add("header-danger"); box.classList.add("box-penal"); }
        else if (data.style === "admin") { strip.classList.add("header-success"); box.classList.add("box-admin"); }
        else { strip.classList.add("header-warning"); box.classList.add("box-info"); }

        // Si es autoequilibrado, cambiamos el emoji principal por tu imagen
        if (isAutoeq && isVMP) {
            // AQUI HEMOS AUMENTADO EL TAMAÑO (de 50px a 80px)
            document.getElementById('res-icon').innerHTML = '<img src="logoautoequilibrado.png" style="height: 80px; width: auto; object-fit: contain;">';
            document.getElementById('res-title').innerText = data.title + " (AUTOEQ.)";
        } else {
            document.getElementById('res-icon').innerHTML = data.icon; // Volvemos a usar el emoji normal
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
                // AQUI HEMOS CAMBIADO EL ICONO DE LA PLACA
                // Si vino por la rama de autoequilibrado, cargamos VMPPLACA.png
                iconSrc = (isAutoeq && isVMP) ? "VMPPLACA.png" : ICON_VMP; 
                iconClass = 'plate-vmp'; 
            }
            // Añadimos onerror para que si aún no has subido las imágenes, no se vea un recuadro roto
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
        document.getElementById('inf-admin-text').innerText = data.text;
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