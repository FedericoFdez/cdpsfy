from string import Template

def count_servers(base_name):
    count = 0
    with open("/etc/hosts", "r") as source:
        for line in source.readlines():
            if base_name in line:
                count += 1
    return count/2

def render_template(template_name, output_name, values):
    template = Template(open(template_name, "r").read())
    with open(output_name, "w") as output:
        output.write(str(template.substitute(values)))

def main():
    num_tracks = count_servers("tracks_")
    num_www = count_servers("www_")

    http_servers = ""
    for i in range(1, num_tracks + 1):
        render_template(template_name="./server_nagios2_template.cfg",
                        output_name="./conf/tracks_" + str(i) + "_nagios2.cfg",
                        values={"server_name": "tracks_" + str(i)})
        http_servers += "tracks_" + str(i) + ","
    for i in range(1, num_www + 1):
        render_template(template_name="./server_nagios2_template.cfg",
                        output_name="./conf/www_" + str(i) + "_nagios2.cfg",
                        values={"server_name": "www_" + str(i)})
        http_servers += "www_" + str(i) + ","
    
    render_template(template_name="./server_nagios2_template.cfg",
                    output_name="./conf/lb1_nagios2.cfg",
                    values={"server_name": "tracks.cdpsfy.es"})
    render_template(template_name="./server_nagios2_template.cfg",
                    output_name="./conf/lb2_nagios2.cfg",
                    values={"server_name": "www.cdpsfy.es"})
    render_template(template_name="./server_nagios2_template.cfg",
                    output_name="./conf/db_nagios2.cfg",
                    values={"server_name": "db"})
    render_template(template_name="./server_nagios2_template.cfg",
                    output_name="./conf/nas_nagios2.cfg",
                    values={"server_name": "nas"})

    render_template(template_name="./hostgroups_nagios2_template.cfg",
                    output_name="./conf/hostgroups_nagios2.cfg",
                    values={"debian_servers": http_servers + "tracks.cdpsfy.es,www.cdpsfy.es,nas,db",
                            "http_servers": http_servers+"tracks.cdpsfy.es,www.cdpsfy.es",
                            "ssh_servers": http_servers})

if __name__ == "__main__":
    main()