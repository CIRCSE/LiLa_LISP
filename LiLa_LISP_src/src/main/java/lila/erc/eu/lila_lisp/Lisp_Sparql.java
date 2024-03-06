package lila.erc.eu.lila_lisp;

import com.opencsv.CSVWriter;
import org.apache.jena.query.QuerySolution;

import org.apache.jena.rdf.model.RDFNode;
import virtuoso.jena.driver.VirtGraph;
import virtuoso.jena.driver.VirtuosoQueryExecution;
import virtuoso.jena.driver.VirtuosoQueryExecutionFactory;

import javax.servlet.*;
import javax.servlet.http.*;
import javax.servlet.annotation.*;
import javax.swing.*;
import java.io.IOException;
import java.io.PrintWriter;
import java.sql.*;
import java.util.ArrayList;
import java.util.Iterator;
import java.util.List;


@WebServlet(name = "Lisp_Sparql", value = "/Lisp_Sparql")
@MultipartConfig
public class Lisp_Sparql extends HttpServlet {
//    @Override
//    protected void doGet(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
//
//
////        VirtGraph set = new VirtGraph("jdbc:virtuoso://localhost:1111/charset=UTF-8/log_enable=2", "", "");
////        VirtuosoQueryExecution virtuosoQueryExecution = VirtuosoQueryExecutionFactory.create(query, set);
////        ResultSet resultSet = virtuosoQueryExecution.execSelect();
////
////        System.out.println(resultSet.getResultVars());
////
////        while (resultSet.hasNext()) {
////            QuerySolution querySolution = resultSet.nextSolution();
////            System.out.println(querySolution);
////            Iterator<String> stringIterator = querySolution.varNames();
////            stringIterator.forEachRemaining(s -> {
////                RDFNode rdfNode = querySolution.get(s);
////                System.out.println(rdfNode.toString());
////            });
////
////        }
//
//        mainExecution(request, response);
//
//    }

    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
        mainExecution(request, response);
    }

    public static void mainExecution(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
//        System.out.println("hit");
        response.setContentType("text/csv");  // Set content type of the response so that jQuery knows what it can expect.
        request.setCharacterEncoding("UTF-8");
        response.setCharacterEncoding("UTF-8");

        String query = request.getParameter("query");

        if (query.toLowerCase().contains("update") || query.toLowerCase().contains("delete") || query.toLowerCase().contains("drop") || query.toLowerCase().contains("insert")){
            response.setStatus(HttpServletResponse.SC_FORBIDDEN);
        }

        PrintWriter outP = response.getWriter();
        outP = response.getWriter();

        query = "SPARQL " + query;
//        System.out.println(query);
        try {
            CSVWriter writer = new CSVWriter(outP);
            Class.forName("virtuoso.jdbc4.Driver");
            Connection conn = DriverManager.getConnection("jdbc:virtuoso://localhost:1111/charset=UTF-8/log_enable=2", "dba", "dba");
            Statement st;


            st = conn.createStatement();
            ResultSet resultSet = st.executeQuery(query);
            ResultSetMetaData rsmd = resultSet.getMetaData();


            int cnt = rsmd.getColumnCount();
            List<String> olist = new ArrayList<>();
            String[] oArray;
            for (int i = 1; i < cnt + 1; i++) {
                olist.add(rsmd.getColumnName(i));
            }

            oArray = new String[olist.size()];
            writer.writeNext(olist.toArray(oArray));


            while (resultSet.next()) {
                Object o;
                olist = new ArrayList<>();
                for (int i = 1; i <= cnt; i++) {
                    o = resultSet.getObject(i);
                    if (resultSet.wasNull())
                        olist.add("");
                    else
                        olist.add(o.toString());
                }
                oArray = new String[olist.size()];
                writer.writeNext(olist.toArray(oArray));

            }
            writer.close();
            conn.close();

            outP.close();
        } catch (Exception e) {
            response.setStatus(HttpServletResponse.SC_NOT_ACCEPTABLE);
            outP.write(e.toString());
        }
    }


}
