import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

def send_gmail_email(sender_email, app_password, recipient_emails, subject, record_data):
    """
    Envia un correo via Gmail SMTP usando TLS.
    """
    if not sender_email or not app_password:
        raise ValueError("No se ha configurado la cuenta de Gmail o la contraseña de aplicación.")

    if isinstance(recipient_emails, str):
        recipients = [r.strip() for r in recipient_emails.split(",") if r.strip()]
    else:
        recipients = recipient_emails

    if not recipients:
        raise ValueError("No se especificaron destinatarios para el correo.")

    msg = MIMEMultipart("alternative")
    msg["From"] = f"Sistema LNet <{sender_email}>"
    msg["To"] = ", ".join(recipients)
    msg["Subject"] = subject

    # Format activities table for HTML email
    activities_html = ""
    activities = record_data.get("activities", [])
    executed_items = [act for act in activities if act.get("checked")]

    if executed_items:
        activities_html += """
        <table border="1" cellpadding="8" cellspacing="0" style="border-collapse: collapse; width: 100%; font-family: Arial, sans-serif; font-size: 14px;">
            <thead>
                <tr style="background-color: #1976d2; color: #ffffff;">
                    <th style="text-align: left;">CÓDIGO SAP / MATERIAL UTILIZADO</th>
                    <th style="text-align: center;">ACTIVIDAD REALIZADA</th>
                    <th style="text-align: center;">UNID / MTS</th>
                </tr>
            </thead>
            <tbody>
        """
        for item in executed_items:
            material_name = item.get("description", item.get("name", ""))
            if item.get("detail"):
                material_name += f" ({item.get('detail')})"
            qty = item.get("unid_mts", "N/A")
            activities_html += f"""
                <tr>
                    <td style="padding: 8px;">{material_name}</td>
                    <td style="text-align: center; padding: 8px; color: green; font-weight: bold;">✔ Ejecutado</td>
                    <td style="text-align: center; padding: 8px; font-weight: bold;">{qty}</td>
                </tr>
            """
        activities_html += "</tbody></table>"
    else:
        activities_html = "<p style='color: #666;'>No se marcaron actividades ejecutadas.</p>"

    observaciones = record_data.get("observations", "Sin observaciones registradas.")
    attachments = record_data.get("attachments", [])
    attachments_html = ""
    if attachments:
        items_li = ""
        for att in attachments:
            orig = att.get("original_name", att.get("filename", "Archivo"))
            size_kb = round(att.get("size", 0) / 1024, 1)
            items_li += f"<li style='margin-bottom: 4px;'>📎 <strong>{orig}</strong> ({size_kb} KB)</li>"
        attachments_html = f"""
        <h3 style="color: #333; border-bottom: 2px solid #1976d2; padding-bottom: 8px; margin-top: 25px;">Archivos y Evidencias Adjuntas</h3>
        <ul style="padding-left: 20px; font-size: 14px; color: #444;">
            {items_li}
        </ul>
        """

    # GPS Link
    gps_info = ""
    if record_data.get("gps_lat") and record_data.get("gps_lng"):
        lat = record_data.get("gps_lat")
        lng = record_data.get("gps_lng")
        gps_info = f"""
        <p style="margin: 6px 0; font-size: 14px; color: #2e7d32;">
            📍 <strong>Ubicación GPS:</strong> {lat}, {lng} — <a href="https://maps.google.com/?q={lat},{lng}" target="_blank" style="color: #1976d2; font-weight: bold;">Ver en Google Maps</a>
        </p>
        """

    # Signature note
    signature_info = ""
    if record_data.get("signature_data"):
        signature_info = """
        <p style="margin: 6px 0; font-size: 13px; color: #0288d1;">
            ✍️ <strong>Firma Digital:</strong> Registrada y adjunta al reporte oficial.
        </p>
        """

    html_content = f"""
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
    </head>
    <body style="font-family: Arial, sans-serif; background-color: #f4f6f9; margin: 0; padding: 20px;">
        <div style="max-width: 650px; margin: 0 auto; background: #ffffff; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); overflow: hidden; border: 1px solid #e0e0e0;">
            <div style="background-color: #1976d2; color: white; padding: 20px; text-align: center;">
                <h2 style="margin: 0; font-size: 22px;">REPORTE DE EJECUCIÓN DE ACTIVIDADES</h2>
                <p style="margin: 5px 0 0 0; opacity: 0.9; font-size: 14px;">Sistema de Gestión LNet</p>
            </div>
            <div style="padding: 24px;">
                <div style="background: #e3f2fd; padding: 15px; border-radius: 6px; margin-bottom: 20px; border-left: 4px solid #1976d2;">
                    <p style="margin: 4px 0; font-size: 15px;"><strong>Nro. Solicitud:</strong> #{record_data.get('solicitud_num')}</p>
                    <p style="margin: 4px 0; font-size: 15px;"><strong>Nombre / Razón Social:</strong> {record_data.get('client_name')}</p>
                    <p style="margin: 4px 0; font-size: 13px; color: #555;"><strong>Registrado Por:</strong> {record_data.get('created_by')} el {record_data.get('created_at')}</p>
                    {gps_info}
                    {signature_info}
                </div>

                <h3 style="color: #333; border-bottom: 2px solid #1976d2; padding-bottom: 8px; margin-top: 25px;">Ejecución de Actividades / Materiales</h3>
                {activities_html}

                <h3 style="color: #333; border-bottom: 2px solid #1976d2; padding-bottom: 8px; margin-top: 25px;">Detalles y Observaciones</h3>
                <div style="background-color: #fafafa; padding: 12px; border-radius: 6px; border: 1px solid #eee; font-size: 14px; white-space: pre-wrap; color: #444;">
                    {observaciones}
                </div>

                {attachments_html}
            </div>
            <div style="background-color: #f5f5f5; color: #777; padding: 12px; text-align: center; font-size: 12px; border-top: 1px solid #eee;">
                Correo generado automáticamente por el Sistema LNet.
            </div>
        </div>
    </body>
    </html>
    """

    msg.attach(MIMEText(html_content, "html", "utf-8"))

    # Connect to Gmail SMTP
    with smtplib.SMTP("smtp.gmail.com", 587) as server:
        server.starttls()
        server.login(sender_email, app_password)
        server.sendmail(sender_email, recipients, msg.as_string())

    return True
